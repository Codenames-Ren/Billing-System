package routes

import (
	"ren/backend-api/src/controllers"
	"ren/backend-api/src/middlewares"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserRoutes(router *gin.Engine, db *gorm.DB) {

	userGroup := router.Group("/users")
	{
		//Endpoint for Register with OTP
		userGroup.POST("/register", controllers.Register)
		// userGroup.POST("/register/verify", controllers.RegisterComplete)
		// userGroup.POST("/register/resend-otp", controllers.ResendRegisterOTP)

		//Endpoint for login with otp
		userGroup.POST("/login", controllers.Login)
		// userGroup.POST("/login/verify", controllers.LoginComplete)
		// userGroup.POST("/login/resend-otp", controllers.ResendLoginOTP)

		//Endpoint for reset password
		// userGroup.POST("/forgot-password", controllers.ForgotPassword)
		// userGroup.POST("/reset-password", controllers.ResetPassword)
		// userGroup.POST("/forgot-password/resend-otp", controllers.ResendForgotPassOTP)
		// userGroup.POST("/verify-reset-otp", controllers.VerifyResetOTP)

		//Endpoint where needs auth
		userGroup.PUT("/update-password", middlewares.AuthMiddleware(), controllers.UpdatePassword)
		userGroup.GET("/profile", middlewares.AuthMiddleware(), func(c *gin.Context) {
			username, _ := c.Get("username")
			c.JSON(200, gin.H{
				"message": "Welcome to your profile!",
				"user"	: username,
			})
		})

		userGroup.GET("/check-login", middlewares.AuthMiddleware(), func (c *gin.Context) {
			username, _ := c.Get("username")
			role, _ := c.Get("role")
			c.JSON(200, gin.H{
				"isLoggedIn": true,
				"username": username,
				"role": role,
			})
		})

		userGroup.POST("/logout", middlewares.AuthMiddleware(), func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Logout successful"})
		})
	}

	//route group admin
	adminGroup := router.Group("/admin", middlewares.AuthMiddleware(), middlewares.AdminMiddleware())
	{
		adminGroup.GET("/dashboard", func(c *gin.Context) {
			username, _ := c.Get("username")
			c.JSON(200, gin.H{
				"message": "Welcome Admin!",
				"admin" : username,
			})
		})

		//nambah endpoint buat grup admin disini
		// adminGroup.GET("/users", controllers.GetAllUsers)
	}

	//superadmin
	// superAdminGroup := router.Group("/sp-admin", middlewares.AuthMiddleware(), middlewares.SuperAdminMiddleware())
	// {
	// 	// superAdminGroup.GET("/users", controllers.GetAllUsers)
	// 	// superAdminGroup.DELETE("/users/:id", controllers.DeleteUser)
	// }
}