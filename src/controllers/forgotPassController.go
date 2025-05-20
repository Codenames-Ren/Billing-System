package controllers

import (
	"net/http"
	"ren/backend-api/src/database"
	"ren/backend-api/src/helper"
	"ren/backend-api/src/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

//forgot password
func ForgotPassword(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//search user by email
	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "If your email is registered, you will received an OTP"})
		return
	}

	user.ResetAllowed = true
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to set reset state"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Please wait. You will be directed to reset password form",
		"user_id": user.ID,
	})
}

func ResetPassword(c *gin.Context) {
	var input struct {
		Email					string `json:"email" binding:"required"`
		Newpassword				string `json:"new_password" binding:"required"`
		ConfirmPassword			string `json:"confirm_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//Validate new Password
	if input.Newpassword != input.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New password and confirm password doesnt match!"})
		return
	}

	//Validate password strength
	if valid, message := helper.ValidatePassword(input.Newpassword); !valid {
		c.JSON(http.StatusBadRequest, gin.H{"error": message})
		return
	}

	//search user by email
	var user models.User
	if err := database.DB.First(&user, "email = ?", input.Email).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found!"})
		return
	}

	// //otp verif
	if !user.ResetAllowed {
		c.JSON(http.StatusUnauthorized, gin.H {"error": "Reset not allowed"})
		return
	}

	//hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Newpassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update password & reset ResetAllowed to false
	if err := database.DB.Model(&user).Updates(map[string]interface{}{
		"password":      string(hashedPassword),
		"reset_allowed": false,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully!",
		"email": user.Email,
	})
}