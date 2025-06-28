package controllers

import (
	"net/http"

	"ren/backend-api/src/database"
	"ren/backend-api/src/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetClientsWithLatestBilling(c * gin.Context) {
	roleInterface, _ := c.Get("role")
	var role string
	if roleInterface != nil {
		role = roleInterface.(string)
	}

	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses hanya untuk admin"})
		return
	}

	var clients []models.Client

	err := database.DB.Preload("Billings", func(db * gorm.DB) *gorm.DB {
		return db.Order("due_date DESC").Limit(1)
	}).Find(&clients).Error

	if err != nil {
		c.JSONP(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data client"})
		return
	}

	c.JSON(http.StatusOK, clients)
}