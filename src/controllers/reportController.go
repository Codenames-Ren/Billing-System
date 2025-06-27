package controllers

import (
	"bytes"
	"log"
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
	log.Println("==> Start GenerateReportPDF")

	role := c.GetString("user_role")
	region := c.GetString("user_region")
	period := c.Query("period")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")

	startDate, err1 := time.Parse("2006-01-02", dateFrom)
	endDate, err2 := time.Parse("2006-01-02", dateTo)
	if err1 != nil || err2 != nil {
		log.Println("❌ Error parsing tanggal:", err1, err2)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal tidak valid"})
		return
	}

	var billings []models.Billing

	db := database.DB.Preload("Client").Preload("Package").Where("status = ? AND updated_at BETWEEN ? AND ?", "paid", startDate, endDate)

	if role == "kasir" {
		db = db.Joins("JOIN clients ON clients.id = billings.client_id").Where("clients.region = ?", region)
	}

	if err := db.Find(&billings).Error; err != nil {
		log.Println("❌ Error ambil billing:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data billing"})
		return
	}

	log.Println("✅ Jumlah billing ditemukan:", len(billings))

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
		log.Println("❌ Error parsing template:", err)
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
		log.Println("❌ Error render template:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal merender html"})
		return
	}

	log.Println("✅ Template berhasil dirender")

	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		log.Println("❌ Error init PDF:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal inisialisasi pdf"})
		return
	}

	pdfg.AddPage(wkhtmltopdf.NewPageReader(strings.NewReader(html.String())))
	pdfg.Orientation.Set(wkhtmltopdf.OrientationPortrait)
	pdfg.PageSize.Set(wkhtmltopdf.PageSizeA4)

	if err = pdfg.Create(); err != nil {
		log.Println("❌ Error create PDF:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat PDF"})
		return
	}

	log.Println("✅ PDF berhasil dibuat, mengirim ke client")

	c.Header("Content-Disposition", "attachment; filename=laporan-pembayaran.pdf")
	c.Data(http.StatusCreated, "application/pdf", pdfg.Bytes())
}

func GetPaymentReports(c *gin.Context) {
	role := c.GetString("user_role")
	region := c.GetString("user_region")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")

	startDate, err1 := time.Parse("2006-01-02", dateFrom)
	endDate, err2 := time.Parse("2006-01-02", dateTo)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal tidak valid"})
		return
	}

	var billings []models.Billing

	db := database.DB.Preload("Client").Preload("Package").Where("status = ? AND updated_at BETWEEN ? AND ?", "paid", startDate, endDate)

	if role == "kasir" {
		db = db.Joins("JOIN clients ON clients.id = billings.client_id").Where("clients.region = ? ", region)
	}

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