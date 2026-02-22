# Backstage Docker Multi-stage Build

このプロジェクトでは、Backstage アプリケーションのDockerマルチステージビルドを設定しています。

## 🚀 特徴

- **マルチステージビルド**: 効率的なレイヤーキャッシュとコンテナサイズの最適化
- **BuildKit対応**: 高速ビルドと並列処理
- **プロダクション対応**: 本番環境向けの最適化された設定

## 📁 ファイル構成

```
├── packages/backend/Dockerfile    # マルチステージビルド用Dockerfile
├── app-config.production.yaml     # プロダクション用設定
├── .dockerignore                  # Dockerビルド除外ファイル
├── docker-build.ps1              # PowerShell ビルドスクリプト
├── docker-build.sh               # Bash ビルドスクリプト
└── DOCKER-README.md              # このファイル
```

## 🛠️ 使用方法

### PowerShell (Windows推奨)

```powershell
# 基本的なビルド
.\docker-build.ps1

# カスタムタグでビルド
.\docker-build.ps1 -Tag "my-backstage:latest"

# BuildKitを無効化してビルド
.\docker-build.ps1 -NoBuildKit
```

### Bash (Linux/macOS)

```bash
# 実行権限を付与
chmod +x docker-build.sh

# 基本的なビルド
./docker-build.sh

# カスタムタグでビルド
./docker-build.sh -t "my-backstage:latest"

# BuildKitを無効化してビルド
./docker-build.sh --no-buildkit
```

### 手動でビルド

```bash
# BuildKitを有効化
export DOCKER_BUILDKIT=1

# イメージをビルド
docker image build . -f packages/backend/Dockerfile -t backstage:multistage

# コンテナを起動
docker run -it -p 7007:7007 backstage:multistage
```

## 🔧 設定

### app-config.production.yaml

プロダクション用の設定ファイルです。以下の項目を必要に応じて調整してください：

- `auth.keys.secret`: 認証用のシークレットキー（本番環境では環境変数から設定推奨）
- `backend.baseUrl`: バックエンドのベースURL
- `app.baseUrl`: アプリケーションのベースURL

### 環境変数での設定

```bash
# 環境変数を使用した起動例
docker run -it -p 7007:7007 \
  -e BACKEND_SECRET="your-secret-key" \
  backstage:multistage
```

## 🐳 マルチステージビルドの構成

1. **Stage 1 (packages)**: package.jsonの依存関係情報を抽出
2. **Stage 2 (build)**: 依存関係のインストールとアプリケーションのビルド
3. **Stage 3 (runtime)**: プロダクション用の最終イメージを構築

## 🔄 開発ワークフロー

```bash
# 1. コードの変更
# 2. Dockerイメージの再ビルド
.\docker-build.ps1

# 3. コンテナの起動
docker run -it -p 7007:7007 backstage:multistage

# 4. ブラウザでアクセス
# http://localhost:7007
```

## ⚡ パフォーマンスの最適化

- **レイヤーキャッシュ**: 依存関係の変更がない限り、既存のレイヤーが再利用されます
- **BuildKit**: 並列ビルドと効率的なキャッシュ管理
- **マルチステージ**: 最終イメージには必要なファイルのみが含まれます

## 🛡️ セキュリティ

- 非root ユーザー (`node`) でアプリケーションを実行
- プロダクション用依存関係のみをインストール
- セキュリティアップデートを含む最新のベースイメージを使用

## 🔍 トラブルシューティング

### ビルドエラーが発生した場合

```bash
# キャッシュをクリアして再ビルド
docker system prune -f
docker image build --no-cache . -f packages/backend/Dockerfile -t backstage:multistage
```

### メモリ不足エラーの場合

```bash
# Nodeのメモリ制限を増加
docker image build . -f packages/backend/Dockerfile -t backstage:multistage \
  --build-arg NODE_OPTIONS="--max-old-space-size=8192"
```

## 📝 注意事項

- ビルドには数分かかる場合があります
- 初回ビルド時は依存関係のダウンロードに時間がかかります
- `app-config.production.yaml` の `secret` は本番環境では適切に設定してください