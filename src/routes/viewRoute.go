package routes

import "github.com/gin-gonic/gin"

func ViewRoute(router *gin.Engine) {
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Cache-Control", "no-store")
	})

	//static route
	router.Static("/public", "./public")

	router.GET("/", func(c *gin.Context) {
		c.Redirect(302, "/login")
	})

	router.GET("/login", func(c *gin.Context) {
		c.File("./public/admin-dashboard/login.html")
	})

	router.GET("/home", func(c *gin.Context) {
		c.File("./public/admin-dashboard/index.html")
	})

	router.GET("/client", func(c *gin.Context) {
		c.File("./public/admin-dashboard/clients.html")
	})

	router.GET("/packages", func(c *gin.Context) {
		c.File("./public/admin-dashboard/package.html")
	})

	router.GET("/manage-users", func(c *gin.Context) {
		c.File("./public/admin-dashboard/user.html")
	})

	router.GET("/report", func(c *gin.Context) {
		c.File("./public/admin-dashboard/report.html")
	})

	router.GET("/message", func(c *gin.Context) {
		c.File("./public/admin-dashboard/message.html")
	})

	router.GET("/setup", func(c *gin.Context) {
		c.File("./public/admin-dashboard/setup.html")
	})
} 