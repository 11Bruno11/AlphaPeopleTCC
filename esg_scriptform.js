// ESG Form Logic - Funcionalidades Exclusivas
function ESGFormLogic() {
    return {
        // Cálculo automático de ROI sustentável
        calculateSustainableROI: function (formContext) {
            try {
                var budget      = formContext.getAttribute("esg_orcamento").getValue();
                var projectType = formContext.getAttribute("esg_tipoprojeto").getValue();
                
                if (budget && projectType) {
                    var roiMultiplier = this.getROIMultiplier(projectType);
                    var estimatedROI  = budget * roiMultiplier;
                    
                    this.showTemporaryNotification(formContext, estimatedROI, "roi");
                }
            } catch (error) {
                console.error("Erro no calculateSustainableROI:", error);
            }
        },

        getROIMultiplier: function (projectType) {
            var multipliers = {
                1: 1.5, // Ambiental  - ROI 150%
                2: 2.0, // Social     - ROI 200%  
                3: 1.8  // Governança - ROI 180%
            };
            return multipliers[projectType] || 1.0;
        },

        // NOTIFICAÇÃO TEMPORÁRIA (some após 5 segundos)
        showTemporaryNotification: function (formContext, roi, type) {
            try {
                var formattedROI = roi.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });
                
                var message 	   = "💰 ROI Estimado: " + formattedROI;
                var notificationId = "roi-calculation";
                
                // Mostra a notificação
                formContext.ui.setFormNotification(
                    message, 
                    "INFO", 
                    notificationId
                );
                
                // Remove após 3 segundos (3000 milissegundos)
                setTimeout(function() {
                    try {
                        formContext.ui.clearFormNotification(notificationId);
                    } catch (e) {
                        console.log("Notificação já removida");
                    }
                }, 3000);
                
            } catch (error) {
                console.error("Erro no showTemporaryNotification:", error);
            }
        },

        // Formatação automática de valores monetários
        formatCurrency: function (formContext) {
            try {
                var budget = formContext.getAttribute("esg_orcamento").getValue();
                
                if (budget) {
                    var formatted = budget.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    });
                    formContext.getControl("esg_orcamento").setNotification(formatted, "currency-format");
                } else {
                    formContext.getControl("esg_orcamento").clearNotification("currency-format");
                }
            } catch (error) {
                console.error("Erro no formatCurrency:", error);
            }
        },

        // Mostrar informações do tipo de projeto (TEMPORÁRIO)
        showProjectTypeInfo: function (formContext) {
            try {
                var projectType = formContext.getAttribute("esg_tipoprojeto").getValue();
                
                var messages = {
                    1: "🌿 PROJETO AMBIENTAL - Foco em sustentabilidade ecológica",
                    2: "👥 PROJETO SOCIAL - Impacto positivo na comunidade", 
                    3: "🏛️ PROJETO GOVERNANÇA - Transparência e conformidade"
                };
                
                if (projectType && messages[projectType]) {
                    var notificationId = "project-type-info";
                    
                    formContext.ui.setFormNotification(
                        messages[projectType],
                        "INFO",
                        notificationId
                    );
                    
                    // Remove após 3 segundos
                    setTimeout(function() {
                        try {
                            formContext.ui.clearFormNotification(notificationId);
                        } catch (e) {
                            console.log("Notificação já removida");
                        }
                    }, 3000);
                }
            } catch (error) {
                console.error("Erro no showProjectTypeInfo:", error);
            }
        }
    };
}

// Função OnLoad ao carregar o form
function onLoad() {
    
    // Obter o formContext de forma segura
    var formContext = null;
    
    // Tentativa 1: Usando a API moderna
    if (typeof window !== 'undefined' && window.GetGlobalContext) {
        formContext = window.GetGlobalContext();
    }
    
    // Tentativa 2: Usando Xrm.Page (legacy)
    if (!formContext && typeof Xrm !== 'undefined' && Xrm.Page) {
        formContext = Xrm.Page;
    }
    
    // Tentativa 3: Usando a propriedade global
    if (!formContext && typeof parent !== 'undefined' && parent.Xrm && parent.Xrm.Page) {
        formContext = parent.Xrm.Page;
    }
    
    if (!formContext) {
        console.error("Não foi possível obter formContext. Tentando novamente em 1 segundo...");
        setTimeout(onLoad, 1000);
        return;
    }
    
    try {
        var esgLogic = new ESGFormLogic();
        
        // Registrar eventos após garantir que o form está pronto
        setTimeout(function() {
            try {
                var orcamentoAttribute    = formContext.getAttribute("esg_orcamento");
                var tipoProjetoAttribute  = formContext.getAttribute("esg_tipoprojeto");
                
                if (orcamentoAttribute) {
                    orcamentoAttribute.addOnChange(function () {
                        esgLogic.calculateSustainableROI(formContext);
                    });
                }
                
                if (tipoProjetoAttribute) {
                    tipoProjetoAttribute.addOnChange(function () {
                        esgLogic.showProjectTypeInfo(formContext);
                        esgLogic.calculateSustainableROI(formContext);
                    });
                }
                
            } catch (error) {
                console.error("Erro ao configurar eventos:", error);
            }
        }, 500);
        
    } catch (error) {
        console.error("Erro no onLoad:", error);
    }
}

// Função Inativada
function onSave() {
    try {
        var formContext = null;
        
        // Mesma lógica para obter formContext
        if (typeof window !== 'undefined' && window.GetGlobalContext) {
            formContext = window.GetGlobalContext();
        } else if (typeof Xrm !== 'undefined' && Xrm.Page) {
            formContext = Xrm.Page;
        }
        
    } catch (error) {
        console.error("Erro no onSave:", error);
    }
    
    return true; // Permite o salvamento
}

// INICIALIZAÇÃO AUTOMÁTICA (Fallback)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(onLoad, 1000);
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoad);
} else {
    setTimeout(onLoad, 1000);
}

// Função para Análise Rápida de Sustentabilidade (Botão Comando)
function gerarAnaliseRapida(primaryControl) {
    try {
        console.log("Iniciando análise rápida de sustentabilidade...");
        
        var formContext = primaryControl || 
                         (typeof GetGlobalContext !== "undefined" ? GetGlobalContext() : 
                         (typeof Xrm !== "undefined" ? Xrm.Page : null));
        
        // Obter dados do projeto atual
        var projetoId = formContext.data.entity.getId();
        var projetoNome = formContext.getAttribute("esg_nome").getValue() || "Projeto sem nome";
        var tipoProjeto = formContext.getAttribute("esg_tipoprojeto").getValue();
        var orcamento = formContext.getAttribute("esg_orcamento").getValue();
        var status = formContext.getAttribute("esg_status").getValue();
        
        console.log("Projeto analisado:", projetoNome, "ID:", projetoId);
        
        // Calcular análise (simulação - pode ser mais complexo)
        var pontuacao = calcularPontuacaoRapida(tipoProjeto, orcamento, status);
        var recomendacoes = gerarRecomendacoes(tipoProjeto, pontuacao);
        
        // Mostrar resultado em diálogo personalizado
        var mensagem = `
📊 **ANÁLISE DE SUSTENTABILIDADE**

**Projeto:** ${projetoNome}
**Pontuação Estimada:** ${pontuacao}/100 ⭐

📈 **MÉTRICAS PRINCIPAIS:**
• Alinhamento ESG: ${pontuacao >= 70 ? "✅ Alto" : pontuacao >= 40 ? "⚠️ Médio" : "❌ Baixo"}
• Potencial de Impacto: ${orcamento > 50000 ? "🌍 Alto" : "📊 Moderado"}
• Estágio: ${obterLabelStatus(status)}

💡 **RECOMENDAÇÕES:**
${recomendacoes}

*Análise gerada automaticamente pelo Sistema ESG*
        `;
        
        Xrm.Navigation.openAlertDialog({
            text: mensagem,
            title: "📊 Análise ESG - " + projetoNome
        });
        
    } catch (error) {
        console.error("Erro na análise rápida:", error);
        Xrm.Navigation.openAlertDialog({
            text: "Erro ao gerar análise: " + error.message,
            title: "Erro"
        });
    }
}

// Função auxiliar para calcular pontuação rápida
function calcularPontuacaoRapida(tipoProjeto, orcamento, status) {
    var pontuacao = 50; // Base
    
    // Bônus por tipo de projeto
    if (tipoProjeto) {
        switch (tipoProjeto) {
            case 1: pontuacao += 20; break; // Ambiental
            case 2: pontuacao += 15; break; // Social
            case 3: pontuacao += 18; break; // Governança
        }
    }
    
    // Bônus por orçamento
    if (orcamento) {
        if (orcamento >= 100000) pontuacao += 15;
        else if (orcamento >= 50000) pontuacao += 10;
        else if (orcamento >= 10000) pontuacao += 5;
    }
    
    // Bônus por status
    if (status && status === 3) { // Concluído
        pontuacao += 10;
    }
    
    return Math.min(Math.max(pontuacao, 0), 100);
}

// Função para gerar recomendações contextuais
function gerarRecomendacoes(tipoProjeto, pontuacao) {
    var recomendacoes = [];
    
    if (pontuacao < 40) {
        recomendacoes.push("• Considerar aumentar o investimento em métricas sustentáveis");
        recomendacoes.push("• Documentar melhor os impactos ambientais/sociais");
    }
    
    if (tipoProjeto === 1) { // Ambiental
        recomendacoes.push("• Monitorar redução de emissões de CO2");
        recomendacoes.push("• Implementar métricas de economia de recursos");
    } else if (tipoProjeto === 2) { // Social
        recomendacoes.push("• Acompanhar impacto na comunidade local");
        recomendacoes.push("• Mensurar benefícios sociais gerados");
    } else if (tipoProjeto === 3) { // Governança
        recomendacoes.push("• Garantir transparência nos relatórios");
        recomendacoes.push("• Alinhar com normas ESG internacionais");
    }
    
    if (pontuacao >= 70) {
        recomendacoes.push("• Excelente desempenho! Manter as práticas atuais");
        recomendacoes.push("• Considerar certificações sustentáveis");
    }
    
    return recomendacoes.join("\\n");
}

// Função para obter label do status
function obterLabelStatus(status) {
    switch (status) {
        case 1: return "🟢 Ativo";
        case 2: return "⚫ Inativo"; 
        case 3: return "✅ Concluído";
        case 4: return "❌ Cancelado";
        default: return "⏺️ Não definido";
    }
}