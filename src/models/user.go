package models

import (
	"time"

	"gorm.io/gorm"
) 

type User struct {
	ID 			string 		`gorm:"primarykey"`
	Username 	string 		`gorm:"unique"`
	Email 		string 		`gorm:"unique"`
	Password 	string
	Role 		string 		`gorm:"default:kasir"`
	Region		string		
	Status		string		
	ResetAllowed bool		`gorm:"default:false"`
	CreatedAt 	time.Time
	UpdatedAt 	time.Time
	DeletedAt 	gorm.DeletedAt `gorm:"index"`
}

type Client struct {
	ID 					string 			`gorm:"primarykey"`
	Name		 		string 			
	Address 			string 			
	Region 				string 						
	Whatsapp 			string
	Type				string			
	CreatedAt 			time.Time
	UpdatedAt 			time.Time
	
	Billings 			[]Billing 		`gorm:"foreignKey:ClientID;references:ID" json:"billings,omitempty"`
}

type Billing struct {
	ID         uint      `gorm:"primaryKey"`
	ClientID   string
	PackageID  string

	Client     Client  `gorm:"foreignKey:ClientID;references:ID"`
	Package    Package `gorm:"foreignKey:PackageID;references:ID"`

	InvoiceNo  string
	Status     string
	Total      int
	DueDate    time.Time
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type Package struct {
	ID			string `gorm:"primaryKey"`
	Name		string `gorm:"unique;not null"` //contoh : "Paket 10Mbps"
	Speed		string //Contoh : "10Mbps"
	Price		int		//Harga Perbulan
	CreatedAt 	time.Time
	UpdatedAt	time.Time

	Billings	[]Billing `gorm:"foreignKey:PackageID"`
}