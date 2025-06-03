package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func BillingAccessMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _:= c.Get("role")
		if role != "kasir" && role != "teknisi" && role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access Denied"})
			c.Abort()
			return
		}
		c.Next()
	}
}