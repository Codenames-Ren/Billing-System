package routes

import (
	"ren/backend-api/src/controllers"
	"ren/backend-api/src/middlewares"

	"github.com/gin-gonic/gin"
)

func BillingRoutes(router *gin.Engine) {
	billing := router.Group("/billing", middlewares.AuthMiddleware()) 

	billing.GET("/", controllers.GetBillingByRegion)
	billing.PUT("/:id/status", controllers.UpdateBillingStatus)
	
}