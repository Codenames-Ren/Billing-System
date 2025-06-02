package controllers

import (
	"net/http"

	"ren/backend-api/src/database"
	"ren/backend-api/src/models"

	"github.com/gin-gonic/gin"
)



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