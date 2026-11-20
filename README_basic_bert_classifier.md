# Multi-Label Emotion Classification with BERT (Dual-Mode Pipeline)

An end-to-end multi-label emotion classification pipeline that fine-tunes `bert-base-uncased` on custom emotion datasets. 

---

## ⚡ QUICK START: HOW TO SWITCH TAXONOMIES (7 vs 28 CLASSES)

Before initiating training, you can configure how the labels are processed by setting the `CLASSIFICATION_MODE` variable in **Cell 1**:

```python
# =====================================================================
# GLOBAL CONFIGURATION SWITCH
# =====================================================================
# Set to "EKMAN_7" for the 7 consolidated classes, or "GOEMOTIONS_28" for the full 28 classes
CLASSIFICATION_MODE = "EKMAN_7" 
