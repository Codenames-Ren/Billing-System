package main

import (
	"log"
	"os"
	"ren/backend-api/src/database"
	"ren/backend-api/src/models"
	"ren/backend-api/src/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	//Koneksi ke Database
	database.ConnectDB()

	//automigrate
	database.DB.AutoMigrate(
		&models.User{},
		&models.Client{},
		&models.Billing{},
	)

	//Inisialisasi Server
	router := gin.Default()
	
	// routes.ViewRoute(router)

	router.Use(func (c *gin.Context)  {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	routes.ViewRoute(router)

	// //setup email service
	// smtpPort, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	// emailService := service.EmailService{
	// 	SMTPHost: os.Getenv("SMTP_HOST"),
	// 	SMTPPort: smtpPort,
	// 	Username: os.Getenv("SMTP_USERNAME"),
	// 	Password: os.Getenv("SMTP_PASSWORD"),
	// }


	//Setup Routing
	routes.UserRoutes(router, database.DB)
	routes.ClientRoutes(router)
	routes.BillingRoutes(router)

	//Server berjalan di port 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}