#!/usr/bin/python
import sys, csv, json

fname = sys.argv[1]
f = open(fname,"r")
fw = open("irecord.json","rw")

reader = csv.DictReader( open("iRecord_ExampleData.csv","r"))

#header
#reader.fieldnames 

res = []
n = reader.next()
if ( n ):
    res.append(n)

json.dump(res,fw)
close(fw)
close(f)
