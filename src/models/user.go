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