import cv2
img = cv2.imread("public/predictions.png")
googlePrefix = "https://www.google.com/searchbyimage?image_url=https://dd9fae67.ngrok.io/"

import requests
import os
dirname = 'cropped'
import shutil
shutil.rmtree('cropped')
os.mkdir(dirname)

f = open('coordinates.txt', 'r')
coordinates = f.read()
boxes = coordinates.split('|')

# loop over each identified image
offset = 25
for x in range(len(boxes)-1):
	item = boxes[x].split(',')
	print(item)
	left = int(item[0])
	right = int(item[1])
	top = int(item[2])
	bottom = int(item[3])

	crop_img = img[top+offset:bottom-offset, left+offset:right-offset]
	
	imgFileName = 'cropped/cropped'+str(x)+'.png'
	cv2.imwrite(imgFileName,img)
	r = requests.get(googlePrefix+'predictions.png')
	print(r.text)
