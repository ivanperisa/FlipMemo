using FlipMemo.Models;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Username)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Email)
                .HasMaxLength(320)
                .IsRequired();

            entity.Property(e => e.HashedPassword)
                .HasMaxLength(255)
                .IsRequired();
        });

        base.OnModelCreating(modelBuilder);
    }
}
