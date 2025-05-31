package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

//Secret Key JWT
var secretKey = []byte(os.Getenv("SECRET_KEY"))

//Generate token JWT
func GenerateToken(username, role, region string)(string, error) {
	claims := jwt.MapClaims{
		"username": username,
		"role": role,
		"region": region,
		"exp": time.Now().Add(time.Hour * 3).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

//middleware untuk verifikasi token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header must be in format: Bearer <token>"})
			c.Abort()
			return
		}

		tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		//parse token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil,
				fmt.Errorf("unexpected signing method")
			}
			return secretKey, nil
		})
		
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		//Ambil claims dari token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		//simpan username dan role ke context
		c.Set("username", claims["username"])
		c.Set("role", claims["role"])
		c.Set("region", claims["region"])

		//Lanjut ke endpoint jika token valid
		c.Next()
	}
}

func TeknisiMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "teknisi" && role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access forbidden: Admin only"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access forbidden: Admin only"})
			c.Abort()
			return
		}
		c.Next()
	}
}