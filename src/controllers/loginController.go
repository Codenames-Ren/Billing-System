package controllers

import (
	"net/http"
	"ren/backend-api/src/database"
	"ren/backend-api/src/middlewares"
	"ren/backend-api/src/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

//Login user
func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	//Bind JSON ke struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//Search user by username
	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}


	//Password Check
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// //Generate JWT token
	token, err := middlewares.GenerateToken(user.Username, user.Role, user.Region)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	//return token
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"role": user.Role,
		// "region": user.Region,
		})	
}