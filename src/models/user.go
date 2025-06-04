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
	
	Billings []Billing	
}

type Billing struct {
	ID         	uint      `gorm:"primaryKey"`
	ClientID   	string    
	Client     	Client    `gorm:"foreignKey:ClientID"`
	InvoiceNo  	string    
	Status     	string    
	Package 	string
	Total      	int       
	DueDate    	time.Time 
	CreatedAt  	time.Time
	UpdatedAt  	time.Time
}