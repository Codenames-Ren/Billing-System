package controllers

import (
	"net/http"
	"ren/backend-api/src/database"
	"ren/backend-api/src/models"

	"github.com/gin-gonic/gin"
)

func GetBillingByRegion(c *gin.Context) {
	role, _ := c.Get("role")
	region, _ := c.Get("region")

	var billings []models.Billing
	query := database.DB.
		Joins("JOIN clients ON clients.id = billings.client_id").
		Preload("Client").
		Preload("Package") // ⬅️ Tambahkan ini

	if role == "kasir" {
		query = query.Where("clients.region = ?", region)
	}

	if err := query.Find(&billings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get billing data"})
		return
	}

	c.JSON(http.StatusOK, billings)
}

func UpdateBillingStatus(c *gin.Context) {

	var req struct {
		Status string `json:"status"`
	}

	id := c.Param("id")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Model(&models.Billing{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bill status updated successfully!"})
}