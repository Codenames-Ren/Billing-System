package controllers

import (
	"net/http"
	"ren/backend-api/src/database"
	"ren/backend-api/src/models"

	"fmt"

	"github.com/gin-gonic/gin"
)

//Create new package
func CreatePackage(c *gin.Context) {
	var req struct {
		Name	string	`json:"name" binding:"required"`
		Speed	string	`json:"speed"`
		Price	int		`json:"price" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var count int64
	if err := database.DB.Model(&models.Package{}).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung data paket"})
		return
	}

	// Prefix ID PKG-001, PKG-002, dst.
	newID := fmt.Sprintf("PKG-%03d", count+1)

	pkg := models.Package{
		ID: 		newID,
		Name: 		req.Name,
		Speed: 		req.Speed,
		Price: 		req.Price,
	}

	if err := database.DB.Create(&pkg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambah paket"})
		return
	}

	c.JSON(http.StatusCreated, pkg)
}

//get all packages
func GetAllPackage(c *gin.Context) {
	var packages []models.Package
	if err := database.DB.Preload("Billings").Find(&packages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data paket"})
		return
	}

	c.JSON(http.StatusOK, packages)
}

func GetPackageByID(c *gin.Context) {
	id := c.Param("id")
	var pkg models.Package

	if err := database.DB.Preload("Billings").First(&pkg, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Paket tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, pkg)
}

func UpdatePackage(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Name   		string	`json:"name"`
		Speed		string	`json:"speed"`
		Price		int		`json:"price"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var pkg models.Package
	if err := database.DB.First(&pkg, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Paket tidak ditemukan"})
		return
	}

	//update field
	pkg.Name = req.Name
	pkg.Speed = req.Speed
	pkg.Price = req.Price

	if err := database.DB.Save(&pkg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update paket"})
		return
	}

	c.JSON(http.StatusOK, pkg)
}

func DeletePackage(c *gin.Context) {
	id := c.Param("id")
	
	if err := database.DB.Delete(&models.Package{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus paket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Paket berhasil dihapus",
	})
}