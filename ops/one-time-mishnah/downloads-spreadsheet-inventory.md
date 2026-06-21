# Downloads Spreadsheet Inventory

Generated at: 2026-06-21T13:46:05.453Z
Source directory: Downloads (absolute path intentionally omitted)
Files inventoried: 203
Import candidates: 56

## Guardrails

- This inventory stores filenames, file hashes, sizes, dates, row/column counts, sheet/header signals, and classifications only.
- It does not store spreadsheet rows, email addresses, phone numbers, names, raw headers, formulas, or private export content.
- Historical GHL/GoHighLevel/LeadConnector-named exports are inventory-only migration candidates for first-party BNA Operations; no GHL runtime, client, API key, env var, schema, or connector was added.

## Classification Counts

- accounting_export: 2
- communications_export: 13
- contact_list_candidate: 21
- email_audience_export: 5
- external_lead_list: 48
- import_mapping_reference: 2
- legacy_crm_or_pipeline_export: 29
- one_time_rabbi_scheller_followers: 1
- research_or_campaign_working_file: 4
- unknown_spreadsheet: 78

## Inventory

| ID | File | Ext | Modified | Bytes | Classification | Recommended lane | Header signals | SHA-256 prefix | Import candidate |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| DL-SHEET-f93f34d98e | Rabbi Scheller Followers.xlsx | .xlsx | 2026-06-21 | 35683 | one_time_rabbi_scheller_followers | one_time_crm_import_candidate | none | e17bbb32c8b2 | yes |
| DL-SHEET-3d4dceeb1b | subscribed_email_audience_export_HASH.csv | .csv | 2026-06-21 | 230650 | email_audience_export | email_audience_reconciliation | address, email, name, phone, subscription_status | b1e7bb30e646 | yes |
| DL-SHEET-8c69f34fcd | unsubscribed_email_audience_export_HASH.csv | .csv | 2026-06-21 | 33067 | email_audience_export | email_audience_reconciliation | address, campaign_source, email, name, phone, subscription_status | 4a5f84834b4e | yes |
| DL-SHEET-ead777c4b0 | cleaned_email_audience_export_HASH.csv | .csv | 2026-06-21 | 12324 | email_audience_export | email_audience_reconciliation | address, campaign_source, email, name, phone, subscription_status | b3093f6d3a7b | yes |
| DL-SHEET-25eb3cb2d6 | subscribers_detailed.csv | .csv | 2026-06-17 | 12912 | email_audience_export | email_audience_reconciliation | email, name | 0e05cd969c15 | yes |
| DL-SHEET-2900326013 | subscribers.csv | .csv | 2026-06-16 | 4897 | email_audience_export | email_audience_reconciliation | email, name | 3732cb909f79 | yes |
| DL-SHEET-52183b6239 | _-_-_-Campaigns-9-May-2026-7-Jun-2026.csv | .csv | 2026-06-08 | 799 | accounting_export | accounting_reference_not_crm_import | accounting, campaign_source, name | f8eea9684e98 | no |
| DL-SHEET-ee3255816f | admin_to_office_import_map.csv | .csv | 2026-05-27 | 83 | import_mapping_reference | mapping_reference_only | campaign_source | cdd10cbaf055 | no |
| DL-SHEET-a1afb8071e | shloimie_admin_to_office_import_map.csv | .csv | 2026-05-27 | 143 | import_mapping_reference | mapping_reference_only | campaign_source | 8355bea9a878 | no |
| DL-SHEET-475e517326 | opportunities (16).csv | .csv | 2026-05-04 | 258137 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | c902da359053 | yes |
| DL-SHEET-7ed033f10d | call-log-AC_REDACTED_HASH.csv | .csv | 2026-04-26 | 289941 | communications_export | communications_history_reference | communication_log, phone, student_or_parent | 43f9f63c2fb1 | no |
| DL-SHEET-3ec643562c | sms-log-AC_REDACTED_2026-04-26.csv | .csv | 2026-04-26 | 65993 | communications_export | communications_history_reference | communication_log | 85f95a005a77 | no |
| DL-SHEET-c4f4830ca3 | opportunities (15).csv | .csv | 2026-04-26 | 252707 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | f1a881327b51 | yes |
| DL-SHEET-242cb1eb10 | opportunities (14).csv | .csv | 2026-04-23 | 70931 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 2b2559c5c4b2 | yes |
| DL-SHEET-efb076ad3e | opportunities (13).csv | .csv | 2026-04-23 | 255226 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 62bdec3b0780 | yes |
| DL-SHEET-5cb9b225e3 | ghl-bulk-import-all-2026-04-21 (3).csv | .csv | 2026-04-21 | 1273007 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, email, name, opportunity_pipeline, phone | b90cfda93763 | yes |
| DL-SHEET-3242e58619 | ghl-bulk-import-all-2026-04-21 (2).csv | .csv | 2026-04-21 | 1273007 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, email, name, opportunity_pipeline, phone | b90cfda93763 | yes |
| DL-SHEET-0bfbefca58 | ghl-bulk-import-all-2026-04-21 (1).csv | .csv | 2026-04-21 | 1273007 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, email, name, opportunity_pipeline, phone | b90cfda93763 | yes |
| DL-SHEET-6618807bf0 | ghl-bulk-import-all-2026-04-21.csv | .csv | 2026-04-21 | 1273007 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, email, name, opportunity_pipeline, phone | b90cfda93763 | yes |
| DL-SHEET-bec56be266 | opportunities (12).csv | .csv | 2026-04-20 | 251815 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 4439e7498104 | yes |
| DL-SHEET-fb3bf6edfa | opportunities (11).csv | .csv | 2026-04-20 | 251815 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 4439e7498104 | yes |
| DL-SHEET-919463dd63 | bnei-neviim-academy-transactions-2026-apr-01-to-2026-apr-19.csv | .csv | 2026-04-19 | 5065 | accounting_export | accounting_reference_not_crm_import | accounting, campaign_source, email, name | b4bae2577142 | no |
| DL-SHEET-054011113c | opportunities (10).csv | .csv | 2026-04-19 | 294035 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 59bf98c3752d | yes |
| DL-SHEET-5db677763e | bulk-action-logs[whats app blast v1]-[part-1].csv | .csv | 2026-04-19 | 7926 | communications_export | communications_history_reference | communication_log, name, phone | 30535a3d39af | no |
| DL-SHEET-a31dd3e332 | opportunities (9).csv | .csv | 2026-04-17 | 293990 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | b3abaf4d56af | yes |
| DL-SHEET-a6564af4dd | opportunities (8).csv | .csv | 2026-04-16 | 282485 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 702d42612451 | yes |
| DL-SHEET-32b4f7eb22 | opportunities (7).csv | .csv | 2026-04-16 | 281707 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 0552066f2106 | yes |
| DL-SHEET-09d1414ac9 | opportunities (6).csv | .csv | 2026-04-16 | 281707 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 0552066f2106 | yes |
| DL-SHEET-7a9ecb0c5d | opportunities (5).csv | .csv | 2026-04-16 | 311925 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 5dd1caa1dfcb | yes |
| DL-SHEET-2fe8a0a79d | opportunities (4).csv | .csv | 2026-04-15 | 309384 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 339a9d97f800 | yes |
| DL-SHEET-aad19327c9 | opportunities (3).csv | .csv | 2026-04-15 | 309384 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 339a9d97f800 | yes |
| DL-SHEET-67ace2bebd | opportunities (2).csv | .csv | 2026-04-15 | 309330 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | bf736a213608 | yes |
| DL-SHEET-96f75bf88c | opportunities (1).csv | .csv | 2026-04-15 | 309335 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | 588cf7aeae83 | yes |
| DL-SHEET-b248724c07 | opportunities.csv | .csv | 2026-04-15 | 309352 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | campaign_source, email, name, opportunity_pipeline, phone | a37d55f0fe8b | yes |
| DL-SHEET-54693fd8bb | cohort-2-site-mid-reviews.csv | .csv | 2026-04-14 | 46645 | communications_export | communications_history_reference | address, communication_log, email, name, phone | c9932aff75f1 | no |
| DL-SHEET-e626cc014a | cohort-1-site-low-reviews.csv | .csv | 2026-04-14 | 151919 | communications_export | communications_history_reference | address, communication_log, email, name, phone | 97904b0ffb26 | no |
| DL-SHEET-bb4ac78737 | contacts.csv | .csv | 2026-03-29 | 26682 | contact_list_candidate | needs_operator_review | email, name, phone | c51aba004168 | yes |
| DL-SHEET-98490838a3 | WebCraft-Leads-GHL-Import (2).csv | .csv | 2026-03-21 | 606689 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, name, phone | 89e94653cae2 | yes |
| DL-SHEET-2ca0f5a42b | WebCraft-Leads-GHL-Import (1).csv | .csv | 2026-03-21 | 606689 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, name, phone | 89e94653cae2 | yes |
| DL-SHEET-3bf2483712 | webcraft-leads-ghl-import.csv | .csv | 2026-03-21 | 660188 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, name, phone | d8b7bca49f7e | yes |
| DL-SHEET-6decb9ee84 | final_results_v2.csv | .csv | 2026-03-17 | 15976 | research_or_campaign_working_file | needs_operator_review | phone | b0f093e86536 | no |
| DL-SHEET-fd6897208e | final_results.csv | .csv | 2026-03-16 | 12412 | research_or_campaign_working_file | needs_operator_review | phone | bc37363d5da7 | no |
| DL-SHEET-2fe5ce5d0d | custom_proposals_with_live_links_hebrew (1).csv | .csv | 2026-03-12 | 24158 | research_or_campaign_working_file | needs_operator_review | none | 1844f1be0824 | no |
| DL-SHEET-40959c1943 | custom_proposals_with_live_links_hebrew.csv | .csv | 2026-03-12 | 24158 | research_or_campaign_working_file | needs_operator_review | none | 1844f1be0824 | no |
| DL-SHEET-4ed0d97717 | custom_hebrew_proposals_roi_ranges.csv | .csv | 2026-03-12 | 32612 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | name, opportunity_pipeline, phone | 932282479b2c | yes |
| DL-SHEET-b7abfd6a98 | Facebook_Ads_Leads_No_Phone_Numbers.xlsx | .xlsx | 2026-03-12 | 13038 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, phone | 43a13cac1298 | no |
| DL-SHEET-f1aabd2b84 | businesses_without_phone_numbers.xlsx | .xlsx | 2026-03-12 | 24241 | external_lead_list | possible_lead_import_needs_operator_approval | phone | b4fe8d0adbd6 | no |
| DL-SHEET-a7a6caa2d1 | Doctors_in_Jerusalem_05_Cell_Phones.xlsx | .xlsx | 2026-03-12 | 10152 | external_lead_list | possible_lead_import_needs_operator_approval | phone | 01e87708dc1a | no |
| DL-SHEET-07c10afa3b | facebook_ads_leads_100 (1).csv | .csv | 2026-03-12 | 128795 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, name, phone | 0b05066d3132 | no |
| DL-SHEET-276c78108a | Orthopedists_UCLA_1_Cell_Phones.xlsx | .xlsx | 2026-03-12 | 9450 | external_lead_list | possible_lead_import_needs_operator_approval | phone | af6f9272a449 | no |
| DL-SHEET-99f79da922 | Orthopedists_UCLA_2_Regular_or_No_Mobile.xlsx | .xlsx | 2026-03-12 | 23883 | external_lead_list | possible_lead_import_needs_operator_approval | phone | e0221ffada72 | no |
| DL-SHEET-a69f5d7f5e | doctors_in_jerusalem_any_numbers (1).xlsx | .xlsx | 2026-03-12 | 38193 | external_lead_list | possible_lead_import_needs_operator_approval | none | 5059e2bbce54 | no |
| DL-SHEET-6760d59751 | enriched_facebook_ads_with_numbers (1) (1).csv | .csv | 2026-03-12 | 33599 | external_lead_list | possible_lead_import_needs_operator_approval | none | a8a7f87f37bf | no |
| DL-SHEET-09b05c60ce | doctors_in_jerusalem_any_numbers.xlsx | .xlsx | 2026-03-12 | 38193 | external_lead_list | possible_lead_import_needs_operator_approval | none | 5059e2bbce54 | no |
| DL-SHEET-e5702d339a | google (46) (1).csv | .csv | 2026-03-12 | 34869 | unknown_spreadsheet | needs_operator_review | none | 0b1637cf257f | no |
| DL-SHEET-204b724f79 | google (47).csv | .csv | 2026-03-12 | 50377 | unknown_spreadsheet | needs_operator_review | none | 5e5a695c1ca2 | no |
| DL-SHEET-3c56435e21 | google (46).csv | .csv | 2026-03-12 | 34869 | unknown_spreadsheet | needs_operator_review | none | 0b1637cf257f | no |
| DL-SHEET-a73c91a57b | enriched_facebook_ads_with_numbers (1).csv | .csv | 2026-03-12 | 33599 | external_lead_list | possible_lead_import_needs_operator_approval | none | a8a7f87f37bf | no |
| DL-SHEET-9f98695440 | google (45).csv | .csv | 2026-03-12 | 66105 | unknown_spreadsheet | needs_operator_review | none | 3c7532dc5b31 | no |
| DL-SHEET-bf17d0ec06 | enriched_facebook_ads_with_numbers.csv | .csv | 2026-03-12 | 33599 | external_lead_list | possible_lead_import_needs_operator_approval | none | a8a7f87f37bf | no |
| DL-SHEET-3b8102548e | google (44).csv | .csv | 2026-03-12 | 66105 | unknown_spreadsheet | needs_operator_review | none | 3c7532dc5b31 | no |
| DL-SHEET-56bd27eeb4 | google (43).csv | .csv | 2026-03-12 | 24512 | unknown_spreadsheet | needs_operator_review | none | df96003f1750 | no |
| DL-SHEET-bfb2d081ed | enriched_facebook_ads_leads_100_enriched.csv | .csv | 2026-03-12 | 136606 | external_lead_list | possible_lead_import_needs_operator_approval | none | b854d1d466ec | no |
| DL-SHEET-6d57db86f1 | enriched_facebook_ads_leads_100.csv | .csv | 2026-03-12 | 129830 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, name, phone | acb630cc10d6 | no |
| DL-SHEET-0874e6ecca | facebook_ads_leads_100.csv | .csv | 2026-03-12 | 128795 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, name, phone | 0b05066d3132 | no |
| DL-SHEET-5665a02f40 | Plumbers_in_Tel_Aviv_All_Merged (1).csv | .csv | 2026-03-12 | 85147 | communications_export | communications_history_reference | address, campaign_source, communication_log, name, phone | 7d01935d8e6e | no |
| DL-SHEET-29fd5112e1 | Plumbers_in_Tel_Aviv_All_Merged.csv | .csv | 2026-03-12 | 85147 | communications_export | communications_history_reference | address, campaign_source, communication_log, name, phone | 7d01935d8e6e | no |
| DL-SHEET-094707f42a | webcraft_leads_first20_crosscheck.csv | .csv | 2026-03-12 | 4198 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, name, phone | 93c64fd40c43 | no |
| DL-SHEET-1a3adae650 | webcraft_leads (1).csv | .csv | 2026-03-12 | 87853 | communications_export | communications_history_reference | campaign_source, communication_log, name, phone | 8254c5b2b5b3 | no |
| DL-SHEET-9667eb0f24 | Plumbers_in_Tel_Aviv.xlsx | .xlsx | 2026-03-12 | 65757 | unknown_spreadsheet | needs_operator_review | none | 61648e7a01ac | no |
| DL-SHEET-92399f1b21 | google (42).csv | .csv | 2026-03-11 | 443 | unknown_spreadsheet | needs_operator_review | none | 4e3943e95ab7 | no |
| DL-SHEET-b81432578f | google (41).csv | .csv | 2026-03-11 | 8008 | unknown_spreadsheet | needs_operator_review | none | b9d05d5f023c | no |
| DL-SHEET-76947c9257 | google (40).csv | .csv | 2026-03-11 | 7397 | unknown_spreadsheet | needs_operator_review | none | 4b2c7ddc26b7 | no |
| DL-SHEET-ac4b6fe275 | google (39).csv | .csv | 2026-03-11 | 7361 | unknown_spreadsheet | needs_operator_review | none | 4279c3ee3799 | no |
| DL-SHEET-e61d4407dc | google (38).csv | .csv | 2026-03-11 | 6542 | unknown_spreadsheet | needs_operator_review | none | 6c7ae56ba2b3 | no |
| DL-SHEET-56df033374 | google (37).csv | .csv | 2026-03-11 | 7643 | unknown_spreadsheet | needs_operator_review | none | ba7c53be3c2a | no |
| DL-SHEET-55ed84e84d | google (36).csv | .csv | 2026-03-11 | 7172 | unknown_spreadsheet | needs_operator_review | none | 581c7358a1c2 | no |
| DL-SHEET-e2765dfddd | google (35).csv | .csv | 2026-03-11 | 7428 | unknown_spreadsheet | needs_operator_review | none | 5959cf527ca6 | no |
| DL-SHEET-27f511e960 | google (34).csv | .csv | 2026-03-11 | 6325 | unknown_spreadsheet | needs_operator_review | none | 3ddd6edcb6cb | no |
| DL-SHEET-3a4b089b90 | google (33).csv | .csv | 2026-03-11 | 7305 | unknown_spreadsheet | needs_operator_review | none | f779e4619393 | no |
| DL-SHEET-8fcf058ac3 | webcraft_leads.csv | .csv | 2026-03-11 | 5709 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, name, phone | 4f128d7a72be | no |
| DL-SHEET-4e17dcc52b | Ad_Spend_Prospects_With_Estimates.xlsx | .xlsx | 2026-03-11 | 6655 | contact_list_candidate | needs_operator_review | name, phone | 384c10cbfdce | yes |
| DL-SHEET-f65f775c25 | meta_google_search_pack.csv | .csv | 2026-02-24 | 85796 | unknown_spreadsheet | needs_operator_review | none | 5ab42c9b7794 | no |
| DL-SHEET-f920f894d8 | glassdoor (3).csv | .csv | 2026-02-23 | 205935 | unknown_spreadsheet | needs_operator_review | none | 902c48fc1ed5 | no |
| DL-SHEET-c82b0dfeb7 | google_ads_no_gbp_medical_leads_UPDATED_v8.xlsx | .xlsx | 2026-02-23 | 10243 | communications_export | communications_history_reference | address, communication_log, name, phone | 929b4511a03a | no |
| DL-SHEET-ca044ab714 | gemini_call_list_deduped.xlsx | .xlsx | 2026-02-15 | 8715 | communications_export | communications_history_reference | address, communication_log, name, phone | d52b60d7884d | no |
| DL-SHEET-d09cc90889 | hotisrael (1).csv | .csv | 2026-02-08 | 9004 | contact_list_candidate | needs_operator_review | address, email, name, phone | 114033d74109 | yes |
| DL-SHEET-cfb6d5fc74 | jewish_gut_health_directory_HAS_EMAIL.csv | .csv | 2026-02-08 | 3632 | contact_list_candidate | needs_operator_review | email, name, phone | 8f7281b30ed0 | yes |
| DL-SHEET-08d07c3df7 | jewish_gut_health_directory_email_drafts.csv | .csv | 2026-02-08 | 43341 | contact_list_candidate | needs_operator_review | name | ad01ccc55b98 | yes |
| DL-SHEET-6cc8a19794 | Jewish_Gut_Health_Directory_NO_CONTACT_INFO.csv | .csv | 2026-02-08 | 101 | contact_list_candidate | needs_operator_review | email, name, phone | d0c88f026364 | yes |
| DL-SHEET-755161f5a7 | Jewish_Gut_Health_Directory_MISSING_EMAIL_HAS_OTHER_CONTACT.csv | .csv | 2026-02-08 | 101 | contact_list_candidate | needs_operator_review | email, name, phone | d0c88f026364 | yes |
| DL-SHEET-c6b8020544 | Jewish_Gut_Health_Directory_WITH_EMAIL.csv | .csv | 2026-02-08 | 3632 | contact_list_candidate | needs_operator_review | email, name, phone | 8f7281b30ed0 | yes |
| DL-SHEET-398f47946a | jewish_gut_health_directory.csv | .csv | 2026-02-08 | 3665 | contact_list_candidate | needs_operator_review | email, name, phone | 89c4f6a9bd3b | yes |
| DL-SHEET-11e2fd1728 | minnesota_plumbing_receptionist_emails_filled.csv | .csv | 2026-02-04 | 924 | unknown_spreadsheet | needs_operator_review | none | 8b3e938e2aca | no |
| DL-SHEET-49b0f46f16 | minnesota_plumbing_receptionist_emails.csv | .csv | 2026-02-04 | 765 | contact_list_candidate | needs_operator_review | email | 5bcdba54b133 | yes |
| DL-SHEET-a6e0ae7b07 | hotisrael.csv | .csv | 2026-02-04 | 9004 | contact_list_candidate | needs_operator_review | address, email, name, phone | 114033d74109 | yes |
| DL-SHEET-966000cbd4 | indeed.csv | .csv | 2026-02-04 | 6983 | unknown_spreadsheet | needs_operator_review | none | d24223c3df18 | no |
| DL-SHEET-a59da591f9 | glassdoor (2).csv | .csv | 2026-02-03 | 242304 | unknown_spreadsheet | needs_operator_review | none | 7289537aee27 | no |
| DL-SHEET-c0119465bc | glassdoor (1).csv | .csv | 2026-02-03 | 98032 | unknown_spreadsheet | needs_operator_review | none | ec74660dda78 | no |
| DL-SHEET-16845836ce | glassdoor_ENRICHED.csv | .csv | 2026-02-03 | 7786 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, email, name, phone | 24999b909505 | no |
| DL-SHEET-a2b9cd2de0 | Receptionist_Hiring_Companies_Enriched_Data_REGENERATED.csv | .csv | 2026-02-03 | 15941 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, email, name, phone | 4d833a7b17c5 | no |
| DL-SHEET-53f67dd3d2 | glassdoor.csv | .csv | 2026-02-03 | 29198 | unknown_spreadsheet | needs_operator_review | none | 506231387bab | no |
| DL-SHEET-b9a92c2ebb | Receptionist_Hiring_Companies_Enriched_Data (1).csv | .csv | 2026-02-03 | 19940 | unknown_spreadsheet | needs_operator_review | none | da3727fa0f55 | no |
| DL-SHEET-8089b7e84c | Receptionist_Hiring_Companies_Enriched_Data.csv | .csv | 2026-02-03 | 19940 | unknown_spreadsheet | needs_operator_review | none | da3727fa0f55 | no |
| DL-SHEET-20600f1432 | cilb_certified.csv | .csv | 2026-02-02 | 643903905 | unknown_spreadsheet | needs_operator_review | none | 16bc6ac7e4a8 | no |
| DL-SHEET-9d9a8903e3 | building_code.csv | .csv | 2026-02-02 | 233298447 | unknown_spreadsheet | needs_operator_review | address | dfdaf5deb3f7 | no |
| DL-SHEET-f6456ac921 | cosmetology (1).csv | .csv | 2026-02-02 | 217477589 | unknown_spreadsheet | needs_operator_review | none | 79ca5de8d110 | no |
| DL-SHEET-5cb2510a6c | cams.csv | .csv | 2026-02-02 | 112738687 | unknown_spreadsheet | needs_operator_review | none | eda36380464f | no |
| DL-SHEET-bcd651499f | loba_lic.csv | .csv | 2026-02-02 | 12 | unknown_spreadsheet | needs_operator_review | none | 08cb517c1ddf | no |
| DL-SHEET-37171c2939 | lo_lic (1).csv | .csv | 2026-02-02 | 12 | unknown_spreadsheet | needs_operator_review | none | 08cb517c1ddf | no |
| DL-SHEET-b6194010e1 | elevator.csv | .csv | 2026-02-02 | 30503067 | contact_list_candidate | needs_operator_review | address, name, phone | cd0e7de49981 | yes |
| DL-SHEET-4ccd9fc04f | cosmetology.csv | .csv | 2026-02-02 | 217477589 | unknown_spreadsheet | needs_operator_review | none | 79ca5de8d110 | no |
| DL-SHEET-812b83c68e | electrical.csv | .csv | 2026-02-02 | 65051885 | unknown_spreadsheet | needs_operator_review | none | dcdaf6b1d26a | no |
| DL-SHEET-b615f272ed | BuildingCodeLicensee.csv | .csv | 2026-02-02 | 1976768 | unknown_spreadsheet | needs_operator_review | none | 26d3aba5a640 | no |
| DL-SHEET-bb9cad9262 | lo_lic.csv | .csv | 2026-02-02 | 12 | unknown_spreadsheet | needs_operator_review | none | 08cb517c1ddf | no |
| DL-SHEET-1d04efa86c | Updated_Prospects_Merged_No_Duplicates.csv | .csv | 2026-02-01 | 24053 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, email, name, phone | b619a3a3a07d | no |
| DL-SHEET-ed76158b57 | Actively_Looking_for_Receptionist (1).csv | .csv | 2026-02-01 | 13814 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, email, name, phone | 50c07f3fc99c | no |
| DL-SHEET-2ee0a8d2a8 | Actively_Looking_for_Receptionist.csv | .csv | 2026-02-01 | 13814 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source, email, name, phone | 50c07f3fc99c | no |
| DL-SHEET-e1095cb5ec | bd4005lic.csv | .csv | 2026-02-01 | 460000 | contact_list_candidate | needs_operator_review | address, name | b1704019d5ab | yes |
| DL-SHEET-463fbba7f6 | combined_leads_enrichment_queue (1).csv | .csv | 2026-01-31 | 53370 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, phone | 2aa4d2d479fd | no |
| DL-SHEET-dac5c1f6e4 | jewish plumbers leads.csv | .csv | 2026-01-31 | 53444 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, phone | 278296ca5d3a | no |
| DL-SHEET-631b3a5080 | combined_leads_enrichment_queue.csv | .csv | 2026-01-27 | 53370 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, phone | 2aa4d2d479fd | no |
| DL-SHEET-193365cd38 | warm_targets_jewish_neighborhoods.csv | .csv | 2026-01-25 | 36876 | unknown_spreadsheet | needs_operator_review | none | e91a7464f79a | no |
| DL-SHEET-b54c7d47a4 | jewish_home_services_leads.csv | .csv | 2026-01-25 | 11079 | external_lead_list | possible_lead_import_needs_operator_approval | address, name, phone | 7e1ffead9121 | no |
| DL-SHEET-8553e6df07 | minneapolis.csv | .csv | 2026-01-21 | 55316 | unknown_spreadsheet | needs_operator_review | none | c7f585a69ad1 | no |
| DL-SHEET-963a459e25 | minnesota_plumbers_from_facebook_search_expanded (1).csv | .csv | 2026-01-21 | 7967 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, phone | 2db46ac507e0 | no |
| DL-SHEET-d4d68a31ce | GHL_Master_Import_Cleaned.csv | .csv | 2026-01-21 | 1501192 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, email, phone | 6fe83b539f61 | yes |
| DL-SHEET-f7eaba91c1 | minnesota_plumbers_from_facebook_search_expanded.csv | .csv | 2026-01-21 | 7967 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, phone | 2db46ac507e0 | no |
| DL-SHEET-874f88fc1f | minnesota_plumbers_from_facebook_search (1).csv | .csv | 2026-01-21 | 7055 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, phone | 445040960bf4 | no |
| DL-SHEET-4fc7a5890e | minnesota_plumbers_from_facebook_search_GHL_ready.csv | .csv | 2026-01-21 | 8229 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, email, name, phone | 0836bba1c260 | yes |
| DL-SHEET-0ad35b5b04 | minnesota_plumbers_from_facebook_search.csv | .csv | 2026-01-21 | 7055 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, phone | 445040960bf4 | no |
| DL-SHEET-bd9b707211 | google (32).csv | .csv | 2026-01-21 | 80 | unknown_spreadsheet | needs_operator_review | none | 52ba83b581d7 | no |
| DL-SHEET-2bd66a49e5 | google (31).csv | .csv | 2026-01-21 | 11115 | unknown_spreadsheet | needs_operator_review | none | 028a4099179e | no |
| DL-SHEET-2c5f5b8f9e | google (30).csv | .csv | 2026-01-21 | 80 | unknown_spreadsheet | needs_operator_review | none | 52ba83b581d7 | no |
| DL-SHEET-f22abb1ebf | google (29).csv | .csv | 2026-01-21 | 80 | unknown_spreadsheet | needs_operator_review | none | 52ba83b581d7 | no |
| DL-SHEET-011fecdb69 | google (28).csv | .csv | 2026-01-21 | 17895 | unknown_spreadsheet | needs_operator_review | none | a3a5db73e5e5 | no |
| DL-SHEET-d39a9ec2a2 | MNDLILicRegCertExport_Plumbing (2).csv | .csv | 2026-01-18 | 6746474 | contact_list_candidate | needs_operator_review | address, name | 9e18fa18144d | yes |
| DL-SHEET-8ca0cacbec | ezwaterheater (5).csv | .csv | 2026-01-18 | 4256 | unknown_spreadsheet | needs_operator_review | none | 7e24e75d8e25 | no |
| DL-SHEET-f188e65c9b | ezwaterheater (4).csv | .csv | 2026-01-18 | 4256 | unknown_spreadsheet | needs_operator_review | none | 7e24e75d8e25 | no |
| DL-SHEET-9161202d92 | ezwaterheater (3).csv | .csv | 2026-01-18 | 4256 | unknown_spreadsheet | needs_operator_review | none | 7e24e75d8e25 | no |
| DL-SHEET-b30dd127e8 | ezwaterheater (2).csv | .csv | 2026-01-18 | 4256 | unknown_spreadsheet | needs_operator_review | none | 7e24e75d8e25 | no |
| DL-SHEET-f1c2eeb0e2 | ezwaterheater (1).csv | .csv | 2026-01-18 | 4256 | unknown_spreadsheet | needs_operator_review | none | 7e24e75d8e25 | no |
| DL-SHEET-5d0b0d34e7 | ezwaterheater.csv | .csv | 2026-01-18 | 4256 | unknown_spreadsheet | needs_operator_review | none | bc134c833ee0 | no |
| DL-SHEET-7eeb02f40c | google (27).csv | .csv | 2026-01-18 | 15389 | unknown_spreadsheet | needs_operator_review | none | 6f39b2e77d01 | no |
| DL-SHEET-662e2fbef0 | google (26).csv | .csv | 2026-01-18 | 15389 | unknown_spreadsheet | needs_operator_review | none | 6f39b2e77d01 | no |
| DL-SHEET-6f826ffc9d | google (25).csv | .csv | 2026-01-18 | 14533 | unknown_spreadsheet | needs_operator_review | none | fe69b59b1a0b | no |
| DL-SHEET-983384f41f | google (24).csv | .csv | 2026-01-18 | 13782 | unknown_spreadsheet | needs_operator_review | none | 4c58067da45b | no |
| DL-SHEET-0084ce40c8 | google (23).csv | .csv | 2026-01-18 | 62666 | unknown_spreadsheet | needs_operator_review | none | 2027ecb2f3e4 | no |
| DL-SHEET-4958fad25a | google (22).csv | .csv | 2026-01-18 | 11731 | unknown_spreadsheet | needs_operator_review | none | d08edad138de | no |
| DL-SHEET-f3f6124aae | google (21).csv | .csv | 2026-01-18 | 45864 | unknown_spreadsheet | needs_operator_review | none | 0af281a82b91 | no |
| DL-SHEET-4cb46e3471 | google (20).csv | .csv | 2026-01-18 | 72650 | unknown_spreadsheet | needs_operator_review | none | 462ff36c62f6 | no |
| DL-SHEET-d7b9a99797 | Minneapolis_updated_leads_master.csv | .csv | 2026-01-18 | 164302 | communications_export | communications_history_reference | address, campaign_source, communication_log, phone | cc0c14b6b703 | no |
| DL-SHEET-7788215e5a | Minneapolis_updated_leads_with_phones_only.csv | .csv | 2026-01-18 | 41304 | external_lead_list | possible_lead_import_needs_operator_approval | address, campaign_source, phone | 91fcbd858fa6 | no |
| DL-SHEET-2ad27140d2 | Israel_Plumbers_GHL_Import_2026-01-18_localPhones.csv | .csv | 2026-01-18 | 583023 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, email, name, phone | 480447f232db | yes |
| DL-SHEET-9359fe4474 | Israel_Plumbers_GHL_Import_2026-01-18.csv | .csv | 2026-01-18 | 589458 | legacy_crm_or_pipeline_export | first_party_crm_migration_candidate_no_ghl_runtime | address, campaign_source, email, name, phone | 9e5ddea5f7e0 | yes |
| DL-SHEET-95878710d0 | d (3).csv | .csv | 2026-01-18 | 505328 | contact_list_candidate | needs_operator_review | phone | d4126d6fa67e | yes |
| DL-SHEET-b56c9a75d2 | d (2).csv | .csv | 2026-01-18 | 255006 | contact_list_candidate | needs_operator_review | phone | c98d99ee558e | yes |
| DL-SHEET-315e5317f1 | d (1).csv | .csv | 2026-01-18 | 128427 | contact_list_candidate | needs_operator_review | phone | 42af2112b1a0 | yes |
| DL-SHEET-17a116701a | d.csv | .csv | 2026-01-18 | 48261 | contact_list_candidate | needs_operator_review | phone | a7219bb07f5d | yes |
| DL-SHEET-e0f4ec8224 | google (19).csv | .csv | 2026-01-18 | 69540 | unknown_spreadsheet | needs_operator_review | none | 70f77b45f5d4 | no |
| DL-SHEET-4dfe6174b9 | google (18).csv | .csv | 2026-01-18 | 67534 | unknown_spreadsheet | needs_operator_review | none | d0c8b0fea493 | no |
| DL-SHEET-665cd5b83f | google (17).csv | .csv | 2026-01-18 | 44540 | unknown_spreadsheet | needs_operator_review | none | e164f42dfe93 | no |
| DL-SHEET-6127128ad5 | MNDLILicRegCertExport_Plumbing (1).csv | .csv | 2026-01-18 | 6746474 | contact_list_candidate | needs_operator_review | address, name | 9e18fa18144d | yes |
| DL-SHEET-775857260f | Change Log 4fa517b1a62f460681df06ab47d3dc6e.csv | .csv | 2026-01-18 | 1793 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 6764239d8abc | no |
| DL-SHEET-f9ec46757d | google (16).csv | .csv | 2026-01-18 | 26717 | unknown_spreadsheet | needs_operator_review | none | 208629d7aab2 | no |
| DL-SHEET-fa85e78f92 | bbb (14).csv | .csv | 2026-01-18 | 12582 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 8d7ce2112f83 | no |
| DL-SHEET-1d1941ebad | bbb (13).csv | .csv | 2026-01-18 | 13466 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 6006db1864e4 | no |
| DL-SHEET-422e83de7b | bbb (12).csv | .csv | 2026-01-18 | 14277 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | baa6a7b26c6a | no |
| DL-SHEET-51952e1ba6 | bbb (11).csv | .csv | 2026-01-18 | 13743 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | bc5e5164119d | no |
| DL-SHEET-8e3c1171c3 | bbb (10).csv | .csv | 2026-01-18 | 11761 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | a16dc7a8a0ea | no |
| DL-SHEET-c469a9bb3b | bbb (9).csv | .csv | 2026-01-18 | 10759 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 1a318f3e4fb0 | no |
| DL-SHEET-9bc1c46f50 | bbb (8).csv | .csv | 2026-01-18 | 11576 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 298e9640b17b | no |
| DL-SHEET-f1c6875d3e | bbb (7).csv | .csv | 2026-01-18 | 14130 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 83922afb16ee | no |
| DL-SHEET-a5d1143857 | bbb (6).csv | .csv | 2026-01-18 | 12797 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | a4c5c0f09740 | no |
| DL-SHEET-449ce3f6e1 | bbb (5).csv | .csv | 2026-01-18 | 13441 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | e25acdce0352 | no |
| DL-SHEET-9da9a9e24a | bbb (4).csv | .csv | 2026-01-18 | 13441 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | e25acdce0352 | no |
| DL-SHEET-118fea2239 | bbb (3).csv | .csv | 2026-01-18 | 13892 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 3c52203577c7 | no |
| DL-SHEET-8067d9aa97 | bbb (2).csv | .csv | 2026-01-18 | 15579 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 6c25fdda6f6d | no |
| DL-SHEET-f931d1057f | bbb (1).csv | .csv | 2026-01-18 | 15487 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | cc2c969721a2 | no |
| DL-SHEET-312ac5e27b | bbb.csv | .csv | 2026-01-18 | 14584 | external_lead_list | possible_lead_import_needs_operator_approval | campaign_source | 3dfeb9967105 | no |
| DL-SHEET-53b82cf90c | MNDLILicRegCertExport_Elevator.csv | .csv | 2026-01-18 | 385804 | contact_list_candidate | needs_operator_review | address, name | 559cddc74a3b | yes |
| DL-SHEET-50df8d1988 | MNDLILicRegCertExport_Plumbing.csv | .csv | 2026-01-18 | 5471782 | contact_list_candidate | needs_operator_review | address, name | b591f094a4df | yes |
| DL-SHEET-c822a276c9 | minneapolis_plumbers_deduped (1).csv | .csv | 2026-01-17 | 88904 | communications_export | communications_history_reference | address, campaign_source, communication_log, name, phone | 9c111cd78ca6 | no |
| DL-SHEET-adafa01bae | minneapolis_plumbers_deduped.csv | .csv | 2026-01-17 | 88904 | communications_export | communications_history_reference | address, campaign_source, communication_log, name, phone | 9c111cd78ca6 | no |
| DL-SHEET-d2630e7c55 | google (15).csv | .csv | 2026-01-17 | 443 | unknown_spreadsheet | needs_operator_review | none | 4e3943e95ab7 | no |
| DL-SHEET-db07499b31 | google (14).csv | .csv | 2026-01-17 | 8969 | unknown_spreadsheet | needs_operator_review | none | 1953bfd9eac1 | no |
| DL-SHEET-364d8f07b3 | google (13).csv | .csv | 2026-01-17 | 7942 | unknown_spreadsheet | needs_operator_review | none | eb98aeacd954 | no |
| DL-SHEET-55af92292a | google (12).csv | .csv | 2026-01-17 | 7505 | unknown_spreadsheet | needs_operator_review | none | 1e5461c126ac | no |
| DL-SHEET-71e315eb34 | google (11).csv | .csv | 2026-01-17 | 8653 | unknown_spreadsheet | needs_operator_review | none | 90f3258d535f | no |
| DL-SHEET-b9860549b2 | google (10).csv | .csv | 2026-01-17 | 8842 | unknown_spreadsheet | needs_operator_review | none | d6ad6ab5f8ee | no |
| DL-SHEET-1102265207 | google (9).csv | .csv | 2026-01-17 | 7932 | unknown_spreadsheet | needs_operator_review | none | 114fb4155c32 | no |
| DL-SHEET-85d33239f3 | google (8).csv | .csv | 2026-01-17 | 9509 | unknown_spreadsheet | needs_operator_review | none | d02f22e9c84f | no |
| DL-SHEET-6ede3c60c4 | google (7).csv | .csv | 2026-01-17 | 12067 | unknown_spreadsheet | needs_operator_review | none | 23d9dcce7294 | no |
| DL-SHEET-eff60b0593 | google (6).csv | .csv | 2026-01-17 | 14300 | unknown_spreadsheet | needs_operator_review | none | 2f9d1bfbf1a0 | no |
| DL-SHEET-f2d45c5e95 | google (5).csv | .csv | 2026-01-17 | 443 | unknown_spreadsheet | needs_operator_review | none | 4e3943e95ab7 | no |
| DL-SHEET-4d2bced67d | google (4).csv | .csv | 2026-01-17 | 9513 | unknown_spreadsheet | needs_operator_review | none | dbf5b1a31814 | no |
| DL-SHEET-afaf87b728 | google (3).csv | .csv | 2026-01-17 | 8580 | unknown_spreadsheet | needs_operator_review | none | ee797cbd996f | no |
| DL-SHEET-46a77fd483 | google (2).csv | .csv | 2026-01-17 | 8950 | unknown_spreadsheet | needs_operator_review | none | f3d526f8df39 | no |
| DL-SHEET-8093fbca42 | google (1).csv | .csv | 2026-01-17 | 12725 | unknown_spreadsheet | needs_operator_review | none | 7fd7ddf08f00 | no |
| DL-SHEET-282b2856c9 | google.csv | .csv | 2026-01-17 | 13358 | unknown_spreadsheet | needs_operator_review | none | 5d4e2ecc9779 | no |
| DL-SHEET-17fab148be | Copy of [TEMPLATE] AAA Accelerator Warm Outreach Tracker 👤.xlsx | .xlsx | 2026-01-15 | 434233 | unknown_spreadsheet | needs_operator_review | none | 18685004e97a | no |
| DL-SHEET-aee06bc492 | Notion_DB__Facebook_Groups_v3.csv | .csv | 2025-11-12 | 348 | external_lead_list | possible_lead_import_needs_operator_approval | name | 89ed8c78c9ab | no |
| DL-SHEET-be4dd4673a | Notion_DB__Facebook_Groups_v2.csv | .csv | 2025-11-12 | 242 | external_lead_list | possible_lead_import_needs_operator_approval | name | 24e48c58fb20 | no |

## Next Actions

- Treat `one_time_rabbi_scheller_followers` as the highest-priority One Time CRM import candidate.
- Reconcile email audience exports before any campaign send; keep unsubscribed/cleaned/subscribed source boundaries explicit.
- Use historical CRM/opportunity exports only for first-party BNA Operations migration and deduplication planning; do not revive GHL runtime.
- Before Batch 9D import work, create an import mapping and dedupe plan that uses hashes/IDs from this inventory, not raw row dumps.
