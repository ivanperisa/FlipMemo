using FlipMemo.Data;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Services;
using FlipMemo.Services.External;
using FlipMemo.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options => 
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDictionariesService, DictionariesService>();
builder.Services.AddScoped<IWordsService, WordsService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FlipMemoReact", policy =>
    {
        var url = builder.Configuration["Front:Url"];

        policy.WithOrigins($"{url}")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers(options => options.Filters.Add<ApiExceptionFilter>());

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FlipMemo API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var db = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
            var userId = int.Parse(context.Principal!.FindFirst("userId")!.Value);
            var tokenStamp = context.Principal.FindFirst("securityStamp")!.Value;

            var user = await db.Users.FindAsync(userId);
            if (user == null || user.SecurityStamp != tokenStamp)
            {
                context.Fail("Invalid token: security stamp mismatch.");
            }
        }
    };
});

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"))
    .AddPolicy("UserOrAdmin", policy =>
        policy.RequireRole("User", "Admin"));

builder.Services.AddHttpClient<IWordDictionaryApiService, WordDictionaryApiService>(client =>
{
    client.BaseAddress = new Uri("https://twinword-word-graph-dictionary.p.rapidapi.com/");
    client.DefaultRequestHeaders.Add("X-RapidAPI-Key", builder.Configuration["RapidApi:ApiKey"]);
    client.DefaultRequestHeaders.Add("X-RapidAPI-Host", "twinword-word-graph-dictionary.p.rapidapi.com");
});

builder.Services.AddHttpClient<IDeepTranslateApiService, DeepTranslateApiService>(client =>
{
    client.BaseAddress = new Uri("https://deep-translate1.p.rapidapi.com/");
    client.DefaultRequestHeaders.Add("X-RapidAPI-Key", builder.Configuration["RapidApi:ApiKey"]);
    client.DefaultRequestHeaders.Add("X-RapidAPI-Host", "deep-translate1.p.rapidapi.com");
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FlipMemo API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("FlipMemoReact");

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
