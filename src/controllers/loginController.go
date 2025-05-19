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
		Email string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	//Bind JSON ke struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//Search user by email
	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}


	//Password Check
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// //Generate JWT token
	token, err := middlewares.GenerateToken(user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	//return token
	c.JSON(http.StatusOK, gin.H{"token": token})	
}