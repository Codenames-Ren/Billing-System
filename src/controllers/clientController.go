package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"ren/backend-api/src/database"
	"ren/backend-api/src/models"

	"github.com/gin-gonic/gin"
)

func CreateNewClient(c *gin.Context) {
	var req struct {
		Name     string 	`json:"name" binding:"required"`
		Address  string 	`json:"address" binding:"required"`
		Region   string 	`json:"region" binding:"required"`
		Whatsapp string 	`json:"whatsapp" binding:"required"`
		Type     string 	`json:"type" binding:"required"` // prepaid or postpaid
		PackageID  string 	`json:"package_id" binding:"required"`
		// Total    int    	`json:"total" binding:"required"`
		DueDate  string 	`json:"due_date" binding:"required"` // format: 2025-06-01
	}

	// input validation
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var pkg models.Package
	if err := database.DB.First(&pkg, "id = ?", req.PackageID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Paket tidak ditemukan"})
		return
	}

	var count int64
	if err := database.DB.Model(&models.Client{}).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung data client"})
		return
	}

	newID := fmt.Sprintf("CL-%03d", count+1)

	// Generate ID and parse date
	clientID := newID
	dueDate, err := time.Parse("2006-01-02", req.DueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal jatuh tempo harus YYYY-MM-DD"})
		return
	}

	client := models.Client{
		ID:       clientID,
		Name:     req.Name,
		Address:  req.Address,
		Region:   req.Region,
		Whatsapp: req.Whatsapp,
		Type:     req.Type,
	}
	if err := database.DB.Create(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data client"})
		return
	}

	// Generate First Bill
	invoiceNo := fmt.Sprintf("INV-%s", time.Now().Format("20060102-150405"))
	billing := models.Billing{
		ClientID:  		clientID,
		InvoiceNo: 		invoiceNo,
		Status:    		"unpaid",
		PackageID:   	req.PackageID,
		Total:     		pkg.Price,
		DueDate:   		dueDate,
	}

	if err := database.DB.Create(&billing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tagihan awal"})
		return
	}

		var fullBilling models.Billing
		if err := database.DB.
			Preload("Package").
			Where("id = ?", billing.ID).
			First(&fullBilling).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil billing lengkap"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "New client created successfully!",
		"client": gin.H{
			"id":        client.ID,
			"name":      client.Name,
			"address":   client.Address,
			"region":    client.Region,
			"whatsapp":  client.Whatsapp,
			"type":      client.Type,
			"created_at": client.CreatedAt,
			"updated_at": client.UpdatedAt,
			"billings": []gin.H{
				{
					"id":         fullBilling.ID,
					"client_id":  fullBilling.ClientID,
					"invoice_no": fullBilling.InvoiceNo,
					"status":     fullBilling.Status,
					"package":    fullBilling.Package,
					"total":      fullBilling.Total,
					"due_date":   fullBilling.DueDate,
					"created_at": fullBilling.CreatedAt,
					"updated_at": fullBilling.UpdatedAt,
				},
			},
		},
		"billing": gin.H{
					"id":         fullBilling.ID,
					"client_id":  fullBilling.ClientID,
					"invoice_no": fullBilling.InvoiceNo,
					"status":     fullBilling.Status,
					"package":    fullBilling.Package,
					"total":      fullBilling.Total,
					"due_date":   fullBilling.DueDate,
					"created_at": fullBilling.CreatedAt,
					"updated_at": fullBilling.UpdatedAt,
					"client": gin.H{
						"id":        client.ID,
						"name":      client.Name,
						"address":   client.Address,
						"region":    client.Region,
						"whatsapp":  client.Whatsapp,
						"type":      client.Type,
						"created_at": client.CreatedAt,
						"updated_at": client.UpdatedAt,
			},
		},
	})
}

func GetClientsByRegion(c *gin.Context) {
	roleInterface, _ := c.Get("role")
	regionInterface, _ := c.Get("region")

	// Convert interface{} to string dengan aman
	var role, region string
	if roleInterface != nil {
		role = fmt.Sprintf("%v", roleInterface)
	}
	if regionInterface != nil {
		region = fmt.Sprintf("%v", regionInterface)
	}
	
	var clients []models.Client

	query := database.DB.Preload("Billings").Preload("Billings.Package")


	// Gunakan strings.ToLower untuk case-insensitive comparison
	if strings.ToLower(role) == "kasir" {
		query = query.Where("region = ?", region)
	} else {
		fmt.Println("NON-KASIR role - showing all data")
	}
	
	if err := query.Find(&clients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get client data."})
		return
	}

	c.JSON(http.StatusOK, clients)
}

func UpdateClientType(c *gin.Context) {
	var req struct {
		Type string `json:"type"`
	}

	id := c.Param("id")

	if err := c.ShouldBindJSON(&req); err != nil || (req.Type != "prepaid" && req.Type != "postpaid") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipe harus 'prepaid' atau 'postpaid'"})
		return
	}

	if err := database.DB.Model(&models.Client{}).Where("id = ?", id).Update("type", req.Type).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengubah tipe client"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tipe client berhasil diperbarui"})
}