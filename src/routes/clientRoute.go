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
	}

	//special admin and technician create new client
	clientProtected := router.Group("/clients", middlewares.AuthMiddleware(), middlewares.TeknisiMiddleware())
	{
				clientProtected.POST("/", controllers.CreateNewClient)
	}

}