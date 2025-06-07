using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymFit_BE.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionPlans_1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "SubscriptionPlans");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "SubscriptionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
