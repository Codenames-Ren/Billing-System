package routes

import (
	"ren/backend-api/src/controllers"
	"ren/backend-api/src/middlewares"

	"github.com/gin-gonic/gin"
)

func ReportRoutes(router *gin.Engine) {
	reports := router.Group("/reports", middlewares.AuthMiddleware())

	reports.GET("/payments/pdf", middlewares.KasirMiddleware(), controllers.GenerateReportPDF)
	reports.GET("/payments", middlewares.KasirMiddleware(), controllers.GetPaymentReports)
}
