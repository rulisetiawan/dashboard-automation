# Konsep Dashboard V1

## Versi 1.5 — Primary Utility KPI Treatment

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V1_Concept_v1.4.md`

## 1. Tujuan Pembaruan

Current Utility Usage dan Total Utility Consumption merupakan informasi management utama. Nilainya tidak boleh terlihat seperti note atau metadata sekunder.

## 2. Aturan Tampilan

- Electrical, Water, Steam, dan Thermal Oil tampil langsung pada permukaan card utama.
- Tidak menggunakan inner container berwarna abu-abu.
- Nilai menggunakan ukuran dan kontras yang lebih kuat daripada label.
- Pemisah tipis berwarna aksen digunakan untuk membantu scanning tanpa membungkus data dalam sub-card.
- Kondisi warning tetap memiliki warna status, tetapi tidak menggunakan kotak latar abu-abu.
- Unit dan scope Live Now/Selected Range tetap terlihat jelas.

## 3. Data yang Dipertahankan

- Current Utility Usage: Electrical demand, Water flow, Steam production/header, dan Thermal Oil supply temperature.
- Total Utility Consumption: Electrical energy, Water, Steam, dan Thermal Oil pada selected time range.

## 4. Batasan V1.5

- Nilai utility masih simulated.
- Hierarki visual perlu divalidasi kembali menggunakan data aktual dan rentang nilai commissioning.
