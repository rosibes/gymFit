using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymFit_BE.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionsModel1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubscriptionTypeId",
                table: "Subscriptions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SubscriptionTypeId",
                table: "Subscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
