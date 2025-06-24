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
		//Endpoint for login
		userGroup.POST("/login", controllers.Login)

		//Endpoint for reset password
		userGroup.POST("/forgot-password", controllers.ForgotPassword)
		userGroup.POST("/reset-password", controllers.ResetPassword)

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
	teknisiGroup := router.Group("/teknisi", middlewares.AuthMiddleware(), middlewares.AdminMiddleware())
	{
		teknisiGroup.GET("/dashboard", func(c *gin.Context) {
			username, _ := c.Get("username")
			c.JSON(200, gin.H{
				"message": "Welcome Technician!",
				"admin" : username,
			})
		})

		//nambah endpoint buat grup admin disini
		// adminGroup.GET("/users", controllers.GetAllUsers)
	}

	//admin
	AdminGroup := router.Group("/admin", middlewares.AuthMiddleware(), middlewares.AdminMiddleware())
	{
		//Endpoint for Register
		AdminGroup.POST("/register", controllers.Register)
		AdminGroup.GET("/users", controllers.GetAllUsers)
		AdminGroup.GET("/users/:id", controllers.GetAllUsersById)
		AdminGroup.PUT("/users/:id", controllers.UpdateUser)
		AdminGroup.DELETE("/users/:id", controllers.DeleteUser)
	}
}