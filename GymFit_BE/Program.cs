using System.Reflection;
using System.Text;
using log4net;
using log4net.Config;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OData.ModelBuilder;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;


try
{
    var builder = WebApplication.CreateBuilder(args);

    // Ensure Logs directory exists
    var logsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");
    if (!Directory.Exists(logsPath))
    {
        Directory.CreateDirectory(logsPath);
    }

    log4net.Util.LogLog.InternalDebugging = true; // Opțional: pentru debugging log4net
    var logRepository = LogManager.GetRepository(Assembly.GetEntryAssembly());
    XmlConfigurator.Configure(logRepository, new FileInfo("log4net.config")); // Configurează log4net din fișierul "log4net.config" (XML)
    var logger = LogManager.GetLogger(typeof(Program));


    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "GymFit API", Version = "v1" });

        // Add JWT Authentication
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
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

        // Add ConflictingActionsResolver
        c.ResolveConflictingActions(apiDescriptions =>
        {
            var first = apiDescriptions.First();
            return first;
        });
    });

    // Configure JWT Authentication
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
            };
        });

    //prepare edm model for psql db
    builder.Services.AddDbContext<GymFitContext>(options =>
          options.UseNpgsql(builder.Configuration.GetConnectionString("gymFitConnection")));

    // add odata support for controllers
    var modelBuilder = new ODataConventionModelBuilder();
    modelBuilder.EntitySet<User>("Users");
    modelBuilder.EntitySet<Trainer>("Trainers");
    modelBuilder.EntitySet<Subscriptions>("Subscriptions");
    modelBuilder.EntitySet<Appointments>("Appointments");

    builder.Services.AddControllers()
        .AddOData(opt =>
            opt.Select().Filter().OrderBy().Expand().SetMaxTop(100).AddRouteComponents("odata", modelBuilder.GetEdmModel())); // Adaugă suport OData (filtrare, sortare)

    // Add CORS
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    });

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"Application failed to start: {ex}");
    throw;
}
