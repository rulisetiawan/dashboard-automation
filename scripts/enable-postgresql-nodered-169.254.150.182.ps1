#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

$ruleName = "PT.SMM PostgreSQL 5432 - NodeRED 169.254.150.182"
$remoteAddress = "169.254.150.182"

$rule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($null -eq $rule) {
  New-NetFirewallRule `
    -DisplayName $ruleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort 5432 `
    -RemoteAddress $remoteAddress `
    -Profile Any | Out-Null
} else {
  Set-NetFirewallRule `
    -DisplayName $ruleName `
    -Enabled True `
    -Direction Inbound `
    -Action Allow `
    -Profile Any | Out-Null

  $rule = Get-NetFirewallRule -DisplayName $ruleName
  Set-NetFirewallPortFilter `
    -AssociatedNetFirewallRule $rule `
    -Protocol TCP `
    -LocalPort 5432 | Out-Null
  Set-NetFirewallAddressFilter `
    -AssociatedNetFirewallRule $rule `
    -RemoteAddress $remoteAddress | Out-Null
}

$activeRule = Get-NetFirewallRule -DisplayName $ruleName
$portFilter = $activeRule | Get-NetFirewallPortFilter
$addressFilter = $activeRule | Get-NetFirewallAddressFilter

[pscustomobject]@{
  DisplayName = $activeRule.DisplayName
  Enabled = $activeRule.Enabled
  Action = $activeRule.Action
  Protocol = $portFilter.Protocol
  LocalPort = $portFilter.LocalPort
  RemoteAddress = $addressFilter.RemoteAddress -join ","
} | Format-List
