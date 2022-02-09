#!/bin/sh

openssl req \
    -newkey rsa:2048 \
    -x509 \
    -nodes \
    -keyout /root/recifs_cert.key \
    -new \
    -out /root/recifs_cert.crt \
    -subj '/CN=localhost' \
    -sha256 \
    -days 365

chmod 664 /root/root/recifs_cert.cnf /root/recifs_cert.key /root/recifs_cert.crt
