package routes

import (
	"ren/backend-api/src/controllers"
	"ren/backend-api/src/middlewares"

	"github.com/gin-gonic/gin"
)


func PackageRoutes(router *gin.Engine) {
	paket := router.Group("/package", middlewares.AuthMiddleware())
	{
		paket.GET("/", middlewares.TeknisiMiddleware(), controllers.GetAllPackage)
		paket.GET("/:id", middlewares.TeknisiMiddleware(), controllers.GetPackageByID)

				paket.POST("/", middlewares.AdminMiddleware(), controllers.CreatePackage)
				paket.PUT("/:id", middlewares.AdminMiddleware(), controllers.UpdatePackage)
				paket.DELETE("/:id", middlewares.AdminMiddleware(), controllers.DeletePackage)
	}
}