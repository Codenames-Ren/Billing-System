package routes

import (
	"ren/backend-api/src/controllers"
	"ren/backend-api/src/middlewares"

	"github.com/gin-gonic/gin"
)

func BillingRoutes(router *gin.Engine) {
	billing := router.Group("/billing", middlewares.AuthMiddleware(), middlewares.BillingAccessMiddleware())
	{
		billing.GET("/", controllers.GetBillingByRegion)
	}

	//only admin who can update status bill
	billingProtected := router.Group("/billing", middlewares.AuthMiddleware(), middlewares.KasirMiddleware())
	{
		billingProtected.PUT("/", controllers.UpdateBillingStatus)
	}

}