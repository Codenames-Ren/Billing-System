package controllers

import (
	"fmt"
	"net/http"
	"time"

	"ren/backend-api/src/database"
	"ren/backend-api/src/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateNewClient(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Address  string `json:"address" binding:"required"`
		Region   string `json:"region" binding:"required"`
		Whatsapp string `json:"whatsapp" binding:"required"`
		Type     string `json:"type" binding:"required"` // prepaid or postpaid
		Package  string `json:"package" binding:"required"`
		Total    int    `json:"total" binding:"required"`
		DueDate  string `json:"due_date" binding:"required"` // format: 2025-06-01
	}

	// input validation
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate ID and parse date
	clientID := uuid.New().String()
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
		ClientID:  clientID,
		InvoiceNo: invoiceNo,
		Status:    "unpaid",
		Package:   req.Package,
		Total:     req.Total,
		DueDate:   dueDate,
	}
	if err := database.DB.Create(&billing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tagihan awal"})
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
					"id":         billing.ID,
					"client_id":  billing.ClientID,
					"invoice_no": billing.InvoiceNo,
					"status":     billing.Status,
					"package":    billing.Package,
					"total":      billing.Total,
					"due_date":   billing.DueDate,
					"created_at": billing.CreatedAt,
					"updated_at": billing.UpdatedAt,
				},
			},
		},
		"billing": gin.H{
			"id":         billing.ID,
			"client_id":  billing.ClientID,
			"invoice_no": billing.InvoiceNo,
			"status":     billing.Status,
			"package":    billing.Package,
			"total":      billing.Total,
			"due_date":   billing.DueDate,
			"created_at": billing.CreatedAt,
			"updated_at": billing.UpdatedAt,
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
	role, _:= c.Get("role")
	region, _:= c.Get("region")

	if role != "kasir" && role != "admin"{
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var clients []models.Client
	if err := database.DB.Where("region = ?", region).Find(&clients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get client data."})
		return
	}

	c.JSON(http.StatusOK, clients)
}