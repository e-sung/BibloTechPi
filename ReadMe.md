# What is it?
* This is server part of BibloTechPi Project.
* Cilent Parts
  * [Android](https://github.com/e-sung/BibloTechAndroid)
  * iOS : Coming Soon
  * PWA : Coming Soon
  
# What is BibloTechPi Project?
* Rent and return book with QR code
* Search Books with its title / author / publisher
* Write and read book review 
* Introductory Video : [https://youtu.be/kazQGE6X-ss](https://youtu.be/kazQGE6X-ss) 

# Installation 

## 1. Uninstall legacy version of NodeJS *(In case of Raspbian)*

If you just have installed fresh Raspbian, legacy version of NodeJS is preinstalled.
It’s out of date and doesn’t support many important features. So we have to remove it to install latest version.  

```
sudo apt-get purge nodejs   
sudo apt-get purge npm
```

## 2. Install Latest Stable NodeJS

If your OS is Debian based Linux like Raspbian, type following command.

```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

For other OS users, check out [https://nodejs.org/ko/download/package-manager/](https://nodejs.org/ko/download/package-manager/) 

## 3. Install Mysql 

```
sudo apt-get install mysql-server 
```

During the installation, you will configure root password for the database. **Remember the password.**

## 4. Clone this Repository in your home directory
```
cd ~
git clone https://github.com/e-sung/BibloTechPi-Server.git BibloTechPi-Server
```

## 5. Install Dependencies
```
cd BibloTechPi-Server
npm install
```

## 6. Setup DataBase Tables  and Password
```
npm run setup
```

## 7. Run
```
npm run start
```
