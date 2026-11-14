using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using DCE.Api.Data;
using DCE.Api.Middleware;
using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// --------------------------- Banco de dados (Npgsql) ---------------------------
builder.Services.AddDbContext<DceDbContext>(options =>
    options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

// ------------------------------- Controladores --------------------------------
builder.Services.AddControllers().AddJsonOptions(o =>
{
    // Enums trafegam como SCREAMING_SNAKE_CASE (ex.: EM_CUSTODIA), espelhando o frontend.
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseUpper));
    o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// Respostas de validação no envelope de erro padrão.
builder.Services.Configure<ApiBehaviorOptions>(o =>
{
    o.InvalidModelStateResponseFactory = context =>
    {
        var mensagem = context.ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault(m => !string.IsNullOrWhiteSpace(m)) ?? "Dados inválidos.";

        return new ObjectResult(new ApiErrorResponse
        {
            Erro = "VALIDACAO",
            Mensagem = mensagem,
            StatusCode = StatusCodes.Status400BadRequest,
        })
        { StatusCode = StatusCodes.Status400BadRequest };
    };
});

// --------------------------------- Serviços -----------------------------------
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AuditoriaService>();
builder.Services.AddScoped<DetentoService>();

// ------------------------------ Autenticação JWT ------------------------------
var jwtKey = config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key não configurada.");
var jwtIssuer = config["Jwt:Issuer"] ?? "DCE.Api";
var jwtAudience = config["Jwt:Audience"] ?? "DCE.Frontend";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "nome",
            RoleClaimType = "nivel",
        };
    });

// --------------------------- RBAC por nível de acesso --------------------------
builder.Services.AddAuthorization(options =>
{
    // Nível 1 — Comando / Staff: acesso total.
    options.AddPolicy("Comando", p => p.RequireAuthenticatedUser().RequireClaim("nivel", "1"));
    // Níveis 1 e 2 — Oficialidade e Supervisão.
    options.AddPolicy("Oficialidade", p => p.RequireAuthenticatedUser().RequireClaim("nivel", "1", "2"));
    // Níveis 1, 2 e 3 — qualquer oficial autenticado.
    options.AddPolicy("Operacional", p => p.RequireAuthenticatedUser().RequireClaim("nivel", "1", "2", "3"));
});

// ------------------------------------ CORS ------------------------------------
var origens = config.GetSection("Cors:Origens").Get<string[]>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    if (origens is { Length: > 0 })
        policy.WithOrigins(origens).AllowAnyHeader().AllowAnyMethod();
    else
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
}));

// ------------------------------ Swagger / OpenAPI ----------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DCE API — Departamento de Custódia do Estado",
        Version = "v1",
        Description = "API REST para gestão de fichas criminais, oficiais e disciplina (RBAC + JWT).",
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Informe o token no formato: Bearer {seu_token}",
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
            },
            Array.Empty<string>()
        },
    });
});

var app = builder.Build();

// --------------------------------- Pipeline ----------------------------------
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DCE API v1");
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// --------------------- Migração / seed (opcionais na inicialização) -----------
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    var db = scope.ServiceProvider.GetRequiredService<DceDbContext>();

    try
    {
        if (config.GetValue("Database:AutoMigrate", false))
        {
            // Se existirem migrations geradas, aplica-as; caso contrário
            // (projeto sem migrations) cria o schema direto a partir dos models.
            if (db.Database.GetMigrations().Any())
                db.Database.Migrate();
            else
                db.Database.EnsureCreated();
        }

        if (config.GetValue("Database:AutoSeed", true))
            DbSeeder.Seed(db);
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex,
            "Não foi possível conectar ao banco para migração/seed. " +
            "Verifique a connection string em appsettings.json (ConnectionStrings:DefaultConnection).");
    }
}

app.Run();
