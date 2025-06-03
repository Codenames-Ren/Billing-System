package middlewares

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func BillingAccessMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found in token"})
			c.Abort()
			return
		}

		fmt.Printf("BillingAccessMiddleware raw role: %v (%T)\n", roleVal, roleVal)

		// HARUS casting ke string, pastikan aman
		roleStr, ok := roleVal.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid role format"})
			return
		}

		if roleStr != "kasir" && roleStr != "teknisi" && roleStr != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access Denied"})
			c.Abort()
			return
		}

		c.Next()
	}
}