package routes

import (
	"ren/backend-api/src/controllers"
	"ren/backend-api/src/middlewares"

	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.Engine) {
	client := router.Group("/clients", middlewares.AuthMiddleware(), middlewares.TeknisiMiddleware())
	{
		client.GET("/", controllers.GetClientsByRegion)
		client.POST("/", controllers.CreateNewClient)
	}



}