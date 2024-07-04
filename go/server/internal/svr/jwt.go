package svr

// import (
// 	"fmt"
// 	"time"

// 	"github.com/golang-jwt/jwt/v5"
// )

// // var keyFunc = func(t *jwt.Token) (interface{}, error) {
// // 	return secretKey, nil
// // }

// type ProtoClaims struct {
// 	Role string `json:"role"`
// 	jwt.RegisteredClaims
// }

// func createToken(userID string, role string) (string, error) {
// 	pc := ProtoClaims{

// 		// UserID: userID,
// 		Role: role,
// 		RegisteredClaims: jwt.RegisteredClaims{
// 			Subject:   userID,
// 			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
// 		},
// 	}
// 	token := jwt.NewWithClaims(
// 		jwt.SigningMethodHS256,
// 		pc,
// 	)
// 	tokenString, err := token.SignedString(secretKey)
// 	if err != nil {
// 		return "", err
// 	}
// 	return tokenString, nil
// }

// func parseToken(tokenTxt string) (ProtoClaims, error) {
// 	pc := ProtoClaims{}
// 	token, err := jwt.ParseWithClaims(
// 		tokenTxt,
// 		&pc, keyFunc,
// 		jwt.WithValidMethods([]string{"HS256"}),
// 	)
// 	if err != nil {
// 		return pc, err
// 	}
// 	if !token.Valid {
// 		return pc, fmt.Errorf("invalid token")
// 	}
// 	return pc, nil
// }
