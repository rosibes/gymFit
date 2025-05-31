using System.Reflection;
using log4net;
using log4net.Config;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.OData.ModelBuilder;
using Microsoft.Extensions.Logging;


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
    builder.Services.AddSwaggerGen();

    //prepare edm model for psql db
    builder.Services.AddDbContext<GymFitContext>(options =>
          options.UseNpgsql(builder.Configuration.GetConnectionString("gymFitConnection")));

    // add odata support for controllers
    var modelBuilder = new ODataConventionModelBuilder();
    modelBuilder.EntitySet<User>("Users");

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
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"Application failed to start: {ex}");
    throw;
}
