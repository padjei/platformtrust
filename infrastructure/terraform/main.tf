terraform {
  required_version = ">= 1.7"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }

  # Configure a remote backend in CI (do not commit secrets).
  # backend "azurerm" {}
}

provider "azurerm" {
  features {}
}

# --- Placeholders: fill in per environment. Never commit real values. ---

# resource "azurerm_resource_group" "platformtrust" {
#   name     = "rg-platformtrust"
#   location = "eastus"
# }

# resource "azurerm_container_app_environment" "platformtrust" {
#   name                = "cae-platformtrust"
#   resource_group_name = azurerm_resource_group.platformtrust.name
#   location            = azurerm_resource_group.platformtrust.location
# }

# resource "azurerm_postgresql_flexible_server" "platformtrust" {
#   name                = "psql-platformtrust"
#   resource_group_name = azurerm_resource_group.platformtrust.name
#   location            = azurerm_resource_group.platformtrust.location
# }

# resource "azurerm_key_vault" "platformtrust" {
#   name                = "kv-platformtrust"
#   resource_group_name = azurerm_resource_group.platformtrust.name
#   location            = azurerm_resource_group.platformtrust.location
# }

# resource "azurerm_storage_account" "platformtrust" {
#   name                     = "stplatformtrust"
#   resource_group_name      = azurerm_resource_group.platformtrust.name
#   location                 = azurerm_resource_group.platformtrust.location
#   account_tier             = "Standard"
#   account_replication_type = "LRS"
# }
