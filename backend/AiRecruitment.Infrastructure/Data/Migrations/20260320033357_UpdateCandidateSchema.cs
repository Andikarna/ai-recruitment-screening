using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiRecruitment.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCandidateSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Candidates",
                newName: "PhoneNumber");

            migrationBuilder.AddColumn<decimal>(
                name: "ExpectedSalary",
                table: "Candidates",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpectedSalary",
                table: "Candidates");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Candidates",
                newName: "Phone");
        }
    }
}
