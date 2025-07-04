package controllers

import (
	"bytes"
	"fmt"
	"net/http"
	"strings"
	"text/template"
	"time"

	"github.com/SebastiaanKlippert/go-wkhtmltopdf"
	"github.com/dustin/go-humanize"
	"github.com/gin-gonic/gin"

	"ren/backend-api/src/database"
	"ren/backend-api/src/models"
)

func GenerateReportPDF(c *gin.Context) {
	roleInterface, _ := c.Get("role")
	regionInterface, _ := c.Get("region")

	var role, region string
	if roleInterface != nil {
		role = fmt.Sprintf("%v", roleInterface)
	}

	if regionInterface != nil {
		region = fmt.Sprintf("%v", regionInterface)
	}

	period := c.Query("period")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")

	startDate, err1 := time.Parse("2006-01-02", dateFrom)
	endDate, err2 := time.Parse("2006-01-02", dateTo)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal tidak valid"})
		return
	}

	var billings []models.Billing

	db := database.DB.Preload("Client").Preload("Package").Where("billings.status = ? AND billings.updated_at BETWEEN ? AND ?", "paid", startDate, endDate)

	if role == "kasir" {
		db = db.Joins("JOIN clients ON clients.id = billings.client_id").Where("clients.region = ?", region)
	}

	if err := db.Find(&billings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data billing"})
		return
	}

	tmpl, err := template.New("report").Funcs(template.FuncMap{
		"formatRupiah": func(v interface{}) string {
			num, ok := v.(int)
			if !ok {
				return "Rp. 0"
			}
			return "Rp. " + humanize.Comma(int64(num))
		},
		"add": func(a, b int) int {
			return a + b
		},
		"now": func() string {
			return time.Now().Format("02 Jan 2006 15:04")
		},
	}).ParseFiles("src/template/reportPayment.gohtml")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal parsing template"})
		return
	}

	var html bytes.Buffer
	err = tmpl.ExecuteTemplate(&html, "report", gin.H{
		"Billings": billings,
		"Period": period,
		"DateFrom": dateFrom,
		"DateTo": dateTo,
	})
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal merender html"})
		return
	}

	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal inisialisasi pdf"})
		return
	}

	pdfg.AddPage(wkhtmltopdf.NewPageReader(strings.NewReader(html.String())))
	pdfg.Orientation.Set(wkhtmltopdf.OrientationPortrait)
	pdfg.PageSize.Set(wkhtmltopdf.PageSizeA4)

	if err = pdfg.Create(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat PDF"})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=laporan-pembayaran.pdf")
	c.Data(http.StatusCreated, "application/pdf", pdfg.Bytes())
}

func GetPaymentReports(c *gin.Context) {
	roleInterface, _ := c.Get("role")
	regionInterface, _ := c.Get("region")

	var role, region string
	if roleInterface != nil {
		role = fmt.Sprintf("%v", roleInterface)
	}

	if regionInterface != nil {
		region = fmt.Sprintf("%v", regionInterface)
	}

	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")

	startDate, err1 := time.Parse("2006-01-02", dateFrom)
	endDate, err2 := time.Parse("2006-01-02", dateTo)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal tidak valid"})
		return
	}

	endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	var billings []models.Billing

	db := database.DB.Model(&models.Billing{}).
		  Joins("JOIN clients ON clients.id =  billings.client_id").
		  Joins("JOIN packages ON packages.id = billings.package_id").
		  Where("billings.status = ? AND billings.updated_at BETWEEN ? AND ?", "paid", startDate, endDate)

	if role == "kasir" {
		db = db.Where("clients.region = ?", region)
	}

	db = db.Select("billings.*, clients.name as client_name, clients.region as client_region, packages.name as package_name").
		 Preload("Client").Preload("Package")

	if err := db.Find(&billings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data billing"})
		return
	}

	var response []gin.H
	for _, b := range billings {
		response = append(response, gin.H{
			"id":					b.ID,
			"client_name": 			b.Client.Name,
			"region": 				b.Client.Region,
			"package_name": 		b.Package.Name,
			"total": 				b.Total,
			"payment-date": 		b.UpdatedAt.Format("2006-01-02"),
		})
	}

	c.JSON(http.StatusOK, response)
}