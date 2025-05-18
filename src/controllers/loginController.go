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

	//Take user data for jwt token 
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found!"})
		return
	}

		//take user id from cookie
	userID, err := c.Cookie("loginData")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Login session expired"})
		return
	}

	//validate user_id
	if userID != user.ID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID mismatch"})
		return
	}


	// //Generate JWT token
	token, err := middlewares.GenerateToken(user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	//delete cookie after login success
	c.SetCookie("loginData", userID, 300, "/", "", false, true)

	//Password Check
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	//return token
	c.JSON(http.StatusOK, gin.H{"token": token})	
}