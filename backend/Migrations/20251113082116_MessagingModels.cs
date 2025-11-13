using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class MessagingModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Watki",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Temat = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    GrupaId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Watki", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Watki_Grupy_GrupaId",
                        column: x => x.GrupaId,
                        principalTable: "Grupy",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Zalaczniki",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OryginalnaNazwa = table.Column<string>(type: "TEXT", nullable: false),
                    SciezkaPliku = table.Column<string>(type: "TEXT", nullable: false),
                    TypMIME = table.Column<string>(type: "TEXT", nullable: false),
                    Rozmiar = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Zalaczniki", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Wiadomosci",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Tresc = table.Column<string>(type: "TEXT", nullable: false),
                    DataWyslania = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AutorId = table.Column<string>(type: "TEXT", nullable: false),
                    WatekId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wiadomosci", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Wiadomosci_AspNetUsers_AutorId",
                        column: x => x.AutorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Wiadomosci_Watki_WatekId",
                        column: x => x.WatekId,
                        principalTable: "Watki",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WiadomoscZalacznik",
                columns: table => new
                {
                    WiadomosciId = table.Column<int>(type: "INTEGER", nullable: false),
                    ZalacznikiId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WiadomoscZalacznik", x => new { x.WiadomosciId, x.ZalacznikiId });
                    table.ForeignKey(
                        name: "FK_WiadomoscZalacznik_Wiadomosci_WiadomosciId",
                        column: x => x.WiadomosciId,
                        principalTable: "Wiadomosci",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WiadomoscZalacznik_Zalaczniki_ZalacznikiId",
                        column: x => x.ZalacznikiId,
                        principalTable: "Zalaczniki",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Watki_GrupaId",
                table: "Watki",
                column: "GrupaId");

            migrationBuilder.CreateIndex(
                name: "IX_Wiadomosci_AutorId",
                table: "Wiadomosci",
                column: "AutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Wiadomosci_WatekId",
                table: "Wiadomosci",
                column: "WatekId");

            migrationBuilder.CreateIndex(
                name: "IX_WiadomoscZalacznik_ZalacznikiId",
                table: "WiadomoscZalacznik",
                column: "ZalacznikiId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WiadomoscZalacznik");

            migrationBuilder.DropTable(
                name: "Wiadomosci");

            migrationBuilder.DropTable(
                name: "Zalaczniki");

            migrationBuilder.DropTable(
                name: "Watki");
        }
    }
}
