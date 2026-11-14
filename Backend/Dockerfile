# ============================================================================
#  DCE.Api — imagem de produção (ASP.NET Core 8)
#  Usada por hosts com Docker (Render, Railway, Fly.io, etc.).
#  O app escuta na porta definida por $PORT (padrão 8080), exigida pela
#  maioria dos PaaS (ex.: Render injeta PORT=10000).
# ============================================================================

# ------------------------------- Build --------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY DCE.Api.csproj ./
RUN dotnet restore DCE.Api.csproj

COPY . ./
RUN dotnet publish DCE.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# ------------------------------ Runtime -------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# --urls tem precedência sobre ASPNETCORE_HTTP_PORTS da imagem base.
CMD ["sh", "-c", "exec dotnet DCE.Api.dll --urls http://+:${PORT:-8080}"]
