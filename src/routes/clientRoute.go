package routes

import (
	"ren/backend-api/src/controllers"
	"ren/backend-api/src/middlewares"

	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.Engine) {
	client := router.Group("/clients", middlewares.AuthMiddleware())
	{
		client.GET("/", controllers.GetClientsByRegion)
		client.PUT("/:id/type", controllers.UpdateClientType)

	}

	//special admin and technician create new client
	clientProtected := router.Group("/clients", middlewares.AuthMiddleware(), middlewares.TeknisiMiddleware())
	{
		clientProtected.POST("/", controllers.CreateNewClient)
	}

	//only admin for dashboard
	admin := router.Group("/admin", middlewares.AuthMiddleware(), middlewares.AdminMiddleware())
	{
		admin.GET("/clients", controllers.GetAllClients)
		admin.GET("/clients-with-billing", controllers.GetClientsWithLatestBilling)
	}

}