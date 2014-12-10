@echo off
set dir=%~dp0
phantomjs "%dir%ext-app-builder.js" %*
