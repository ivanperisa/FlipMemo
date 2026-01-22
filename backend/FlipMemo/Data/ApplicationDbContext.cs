using FlipMemo.Models;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Dictionary> Dictionaries { get; set; }
    public DbSet<Word> Words { get; set; }
    public DbSet<StudyProgress> StudyProgresses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Email)
                .HasMaxLength(200);

            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255);

            entity.Property(e => e.Role)
                .HasMaxLength(30);

            entity.Property(e => e.SecurityStamp)
                .HasMaxLength(64);

            entity.Property(e => e.PasswordResetTokenHash)
                .HasMaxLength(255);
        });

        modelBuilder.Entity<Dictionary>(entity =>
        {
            entity.HasKey(d => d.Id);

            entity.Property(d => d.Name)
                .HasMaxLength(200);

            entity.Property(d => d.Language)
                .HasMaxLength(50);

            entity.HasMany(d => d.Words)
                .WithMany(w => w.Dictionaries);
        });

        modelBuilder.Entity<Word>(entity =>
        {
            entity.HasKey(w => w.Id);

            entity.Property(w => w.SourceWord)
                .HasMaxLength(100);

            entity.Property(w => w.TargetWord)
                .HasMaxLength(100);
        });

        modelBuilder.Entity<StudyProgress>(entity =>
        {
            entity.HasKey(sp => new { sp.UserId, sp.WordId, sp.DictionaryId, sp.Mode });

            entity.Property(sp => sp.Mode)
                .HasConversion<int>();

            entity.HasOne(sp => sp.User)
                .WithMany(u => u.StudyProgresses)
                .HasForeignKey(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(sp => sp.Word)
                .WithMany(w => w.StudyProgresses)
                .HasForeignKey(sp => sp.WordId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sp => sp.Dictionary)
                .WithMany(d => d.StudyProgresses)
                .HasForeignKey(sp => sp.DictionaryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        base.OnModelCreating(modelBuilder);
    }
}
