# NguyenPanda.com

[![Python](https://img.shields.io/badge/Python-3.12%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/Powered%20By-PandaHttpd-ff69b4?style=for-the-badge)](https://github.com/nguyenpanda/PandaHttpd)
[![Status](https://img.shields.io/website?url=https%3A%2F%2Fnguyenpanda.com&style=for-the-badge&label=nguyenpanda.com)](https://nguyenpanda.com)

**My digital headquarters.** A showcase of research, engineering projects, and the networks built at **HCMUT**, **iST**, and **HPCC**.

## 🚀 Powered by a `PandaHttpd` a Raw Socket framework

This website does not use Django, FastAPI, Flask, or WSGI/ASGI wrappers. It runs on **[`PandaHttpd`](https://github.com/nguyenpanda/PandaHttpd)**, a custom HTTP server framework I built from scratch using **Python raw sockets**.

* **Zero Abstraction:** Direct TCP/IP stack implementation.
* **Byte-level Control:** Manual HTTP request parsing and response construction.
* **Pure Performance:** Optimized specifically for this deployment environment.

## 📦 Smart Asset Pipeline

To keep the git history clean, heavy assets (High-res images, datasets) are decoupled from the codebase using a custom **Pack/Unpack** logic:

1. **Selective Packing (`pack.py`):** Compresses only `public/data` and `public/images` into a flat zip, automatically stripping system junk (`.DS_Store`, `__MACOSX`).

2. **Smart Merging (`setup.py`):** Downloads and merges assets into your local `public/` folder. It intelligently updates data/images while **preserving your existing logs** (`public/errors`).

## 🛠 Quick Start

### 1. Setup Environment

```bash
git clone --recursive https://github.com/nguyenpanda/nguyenpanda.com.git
cd nguyenpanda.com
git submodule update --init --recursive
```

**IMPORTANCE**: You must remove the `[tool.uv.workspace]` section in all submodule's `pyproject.toml`

```bash
uv add --editable ./lib/PandaHttpd
# Install dependencies (Recommended: uv)
uv sync
```

### 2. Asset Synchronization

You need the `GDRIVE_ID` to fetch the decoupled assets. This can be get from a public url Google Drive. For example, `https://drive.google.com/file/d/<your-access-id-here>/view?usp=sharing`

```bash
# Downloads, cleans, and merges assets automatically
export GDRIVE_ID="your-access-id-here"
uv run setup.py
```

Note: Recommend using `.env` file

### 3. Ignite

Start the PandaHttpd server instance:

```bash
uv run main.py
```

Server live at: `http://localhost:8080`

**NOTE**: Configure can be changed in `.yaml` file located in `config/`. This powered by another package called **[`PandaConfig`](https://github.com/nguyenpanda/PandaConfig)**.

---

## 🤝 Acknowledgements

Special thanks to the academic support and resources provided by:

* **[iST HCMUT]** Advanced Institute of Interdisciplinary Science and Technology.

* **[HPCC HCMUT]** High Performance Computing Center.

## 📬 Contact

### Ha Tuong Nguyen (Nguyen Panda)

* 📧 [nguyenpanda@nguyenpanda.com](mailto:nguyenpanda@nguyenpanda.com)
* 🌐 [https://nguyenpanda.com](https://nguyenpanda.com)

© 2026 Ha Tuong Nguyen. All Rights Reserved.
