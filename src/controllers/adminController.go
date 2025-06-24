package controllers

import (
	"net/http"
	"ren/backend-api/src/database"
	"ren/backend-api/src/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func GetAllUsers(c *gin.Context) {
	var users []models.User

	//Get all users from Database
	if err := database.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fecth users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

func GetAllUsersById(c *gin.Context) {
	id := c.Param("id")

	var user []models.User
	if err := database.DB.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"users": user,
	})	
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found!"})
		return
	}

	if err := database.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully!"})
}

// controllers/user_controller.go
func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password,omitempty"`
		Region   string `json:"region"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Username = input.Username
	user.Email = input.Email
	user.Region = input.Region
	user.Role = input.Role

	if input.Password != "" {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		user.Password = string(hashed)
	}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}


func GetAllClients(c *gin.Context) {
	var clients []models.Client
	if err := database.DB.
		Preload("Billings").
		Preload("Billings.Package").
		Find(&clients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch client data"})
		return
	}

	c.JSON(http.StatusOK, clients)
}